"use client";

import { LandmarkPhoto } from "@/components/LandmarkPhoto";
import { LocationPickerMapLazy } from "@/components/maps/LocationPickerMapLazy";
import type {
  AdminLocation,
  CommonsPhotoResult,
  GeocodeSuggestion,
  PlaceSuggestion,
} from "@/lib/admin-location-types";
import { distanceMeters } from "@/lib/geo";
import type { BoardSetId } from "@/lib/board-sets";
import { resizeImageForUpload } from "@/lib/client-image";
import { commonsLandmarkImageUrl, landmarkImageProxyUrl } from "@/lib/landmark-image-url";
import { COLOR_GROUP_STYLES } from "@/lib/locations-data";
import { rentFromPrice } from "@/lib/property-economics";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type StagedPhoto =
  | { kind: "commons"; file: string; previewUrl: string }
  | { kind: "upload"; file: File; previewUrl: string }
  | { kind: "clear" };

type Props = {
  mode: "create" | "edit";
  boardSet: BoardSetId;
  location?: AdminLocation;
  neighbours: AdminLocation[];
  defaultCenter: { latitude: number; longitude: number };
  onClose: () => void;
  onSaved: () => void;
};

const inputClass = "w-full rounded-xl border border-cloudera-border px-3 py-2 text-sm";
const smallBtn =
  "rounded-lg border border-cloudera-border bg-white px-3 py-1.5 text-xs font-semibold text-cloudera-navy hover:bg-cloudera-muted disabled:opacity-60";

const COORD_PAIR = /^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/;

function fmt(n: number) {
  return n.toFixed(6);
}

async function readError(res: Response, fallback: string) {
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  return body.error ?? fallback;
}

export function PropertyEditor({
  mode,
  boardSet,
  location,
  neighbours,
  defaultCenter,
  onClose,
  onSaved,
}: Props) {
  const startLat = location?.latitude ?? defaultCenter.latitude;
  const startLng = location?.longitude ?? defaultCenter.longitude;

  const [name, setName] = useState(location?.name ?? "");
  const [colorGroup, setColorGroup] = useState(location?.colorGroup ?? "brown");
  const [priceText, setPriceText] = useState(String(location?.price ?? 100));
  const [latText, setLatText] = useState(fmt(startLat));
  const [lngText, setLngText] = useState(fmt(startLng));
  const [verified, setVerified] = useState(location?.verified ?? false);
  const [wikidataId, setWikidataId] = useState<string | null>(location?.wikidataId ?? null);
  const [staged, setStaged] = useState<StagedPhoto | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [addressQuery, setAddressQuery] = useState("");
  const [addressResults, setAddressResults] = useState<GeocodeSuggestion[] | null>(null);
  const [addressBusy, setAddressBusy] = useState(false);

  const [wikiQuery, setWikiQuery] = useState(location?.name ?? "");
  const [wikiResults, setWikiResults] = useState<PlaceSuggestion[] | null>(null);
  const [wikiBusy, setWikiBusy] = useState(false);

  const [photoQuery, setPhotoQuery] = useState(location?.name ?? "");
  const [photoResults, setPhotoResults] = useState<CommonsPhotoResult[] | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);

  const [note, setNote] = useState<string | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const lat = Number(latText);
  const lng = Number(lngText);
  const coordsValid =
    latText.trim() !== "" &&
    lngText.trim() !== "" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180;
  const price = Number(priceText);
  const priceValid = Number.isInteger(price) && price >= 10 && price <= 5000;

  const stagedUploadUrl = staged?.kind === "upload" ? staged.previewUrl : null;
  useEffect(() => {
    return () => {
      if (stagedUploadUrl) URL.revokeObjectURL(stagedUploadUrl);
    };
  }, [stagedUploadUrl]);

  const setPosition = useCallback((latitude: number, longitude: number) => {
    setLatText(fmt(latitude));
    setLngText(fmt(longitude));
  }, []);

  const movedM =
    location && coordsValid
      ? Math.round(distanceMeters(location.latitude, location.longitude, lat, lng))
      : null;

  const mapNeighbours = useMemo(
    () =>
      neighbours
        .filter((n) => n.id !== location?.id)
        .map((n) => ({ id: n.id, name: n.name, latitude: n.latitude, longitude: n.longitude })),
    [neighbours, location?.id],
  );

  function onCoordPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const match = COORD_PAIR.exec(event.clipboardData.getData("text"));
    if (match) {
      event.preventDefault();
      setLatText(match[1]);
      setLngText(match[2]);
    }
  }

  function useMyLocation() {
    setError(null);
    if (!navigator.geolocation) {
      setError("This browser cannot share its location.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition(pos.coords.latitude, pos.coords.longitude);
        setNote(`Pin moved to your current location (accurate to about ${Math.round(pos.coords.accuracy)} m).`);
      },
      () => setError("Could not read your location. Check the browser's location permission."),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  async function searchAddress() {
    setAddressBusy(true);
    setError(null);
    setAddressResults(null);
    const params = new URLSearchParams({ q: addressQuery });
    if (coordsValid) {
      params.set("lat", String(lat));
      params.set("lng", String(lng));
    }
    const res = await fetch(`/api/admin/locations/geocode?${params}`);
    setAddressBusy(false);
    if (!res.ok) {
      setError(await readError(res, "Address search failed."));
      return;
    }
    setAddressResults(((await res.json()) as { results: GeocodeSuggestion[] }).results);
  }

  async function searchWikidata() {
    setWikiBusy(true);
    setError(null);
    setWikiResults(null);
    const params = new URLSearchParams({ q: wikiQuery });
    if (coordsValid) {
      params.set("lat", String(lat));
      params.set("lng", String(lng));
    }
    const res = await fetch(`/api/admin/locations/suggest?${params}`);
    setWikiBusy(false);
    if (!res.ok) {
      setError(await readError(res, "Wikidata search failed."));
      return;
    }
    setWikiResults(((await res.json()) as { suggestions: PlaceSuggestion[] }).suggestions);
  }

  function stageCommons(file: string) {
    setStaged({ kind: "commons", file, previewUrl: commonsLandmarkImageUrl(file, 480) });
  }

  function applySuggestion(s: PlaceSuggestion, withPhoto: boolean) {
    setPosition(s.latitude, s.longitude);
    setWikidataId(s.id);
    if (withPhoto && s.imageFile) stageCommons(s.imageFile);
    setNote(`Applied "${s.label}" from Wikidata. Check the pin and photo, then save.`);
  }

  async function searchPhotos() {
    setPhotoBusy(true);
    setError(null);
    setPhotoResults(null);
    const res = await fetch(`/api/admin/locations/photo-search?${new URLSearchParams({ q: photoQuery })}`);
    setPhotoBusy(false);
    if (!res.ok) {
      setError(await readError(res, "Photo search failed."));
      return;
    }
    setPhotoResults(((await res.json()) as { photos: CommonsPhotoResult[] }).photos);
  }

  async function onFileChosen(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      const resized = await resizeImageForUpload(file);
      setStaged({ kind: "upload", file: resized, previewUrl: URL.createObjectURL(resized) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that photo.");
    }
  }

  async function save() {
    setError(null);
    if (name.trim().length < 2) return setError("Enter a property name.");
    if (!priceValid) return setError("Price must be a whole number from 10 to 5000.");
    if (!coordsValid) return setError("Enter valid latitude and longitude values.");

    setBusy(true);
    const body: Record<string, unknown> = {
      name: name.trim(),
      colorGroup,
      price,
      latitude: lat,
      longitude: lng,
      verified,
      wikidataId,
    };
    if (staged?.kind === "commons") body.commonsFile = staged.file;
    if (staged?.kind === "clear" && mode === "edit") body.clearPhoto = true;

    const res =
      mode === "create"
        ? await fetch("/api/admin/locations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...body, boardSet }),
          })
        : await fetch(`/api/admin/locations/${location!.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

    if (!res.ok) {
      setBusy(false);
      setError(await readError(res, "Could not save property."));
      return;
    }

    if (staged?.kind === "upload") {
      const saved = (await res.json()) as { location: AdminLocation };
      const form = new FormData();
      form.append("photo", staged.file);
      const photoRes = await fetch(`/api/admin/locations/${saved.location.id}/photo`, {
        method: "POST",
        body: form,
      });
      if (!photoRes.ok) {
        setBusy(false);
        setError(
          `Property saved, but the photo upload failed: ${await readError(photoRes, "unknown error")}`,
        );
        onSaved();
        return;
      }
    }

    setBusy(false);
    onSaved();
    onClose();
  }

  async function remove() {
    if (!location) return;
    if (!window.confirm(`Delete "${location.name}" from this board? This cannot be undone.`)) return;
    setBusy(true);
    setError(null);
    let res = await fetch(`/api/admin/locations/${location.id}`, { method: "DELETE" });
    if (res.status === 409) {
      const info = (await res.json().catch(() => ({}))) as {
        needsConfirm?: boolean;
        ownershipCount?: number;
        visitCount?: number;
      };
      if (info.needsConfirm) {
        const proceed = window.confirm(
          `"${location.name}" has game history: ${info.ownershipCount} ownership record(s) and ${info.visitCount} check-in/payment record(s) will be permanently deleted, and teams will lose this property. Delete anyway?`,
        );
        if (!proceed) {
          setBusy(false);
          return;
        }
        res = await fetch(`/api/admin/locations/${location.id}?force=true`, { method: "DELETE" });
      }
    }
    setBusy(false);
    if (!res.ok) {
      setError(await readError(res, "Could not delete property."));
      return;
    }
    onSaved();
    onClose();
  }

  const currentPhoto =
    staged?.kind === "clear"
      ? null
      : staged
        ? staged.previewUrl
        : location?.landmarkImageUrl
          ? landmarkImageProxyUrl(location.id, location.photoRev)
          : null;

  const hasHistory = (location?.ownershipCount ?? 0) + (location?.visitCount ?? 0) > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "create" ? "Add property" : `Edit ${location?.name}`}
    >
      <div className="my-auto w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold text-cloudera-navy">
            {mode === "create" ? "Add property" : "Edit property"}
          </h2>
          <button type="button" onClick={onClose} className={smallBtn}>
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_9rem_7rem]">
          <label className="block text-sm font-semibold text-cloudera-navy">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputClass} mt-1 font-normal`}
              maxLength={80}
            />
          </label>
          <label className="block text-sm font-semibold text-cloudera-navy">
            Colour group
            <select
              value={colorGroup}
              onChange={(e) => setColorGroup(e.target.value)}
              className={`${inputClass} mt-1 font-normal`}
            >
              {Object.entries(COLOR_GROUP_STYLES).map(([key, style]) => (
                <option key={key} value={key}>
                  {style.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-cloudera-navy">
            Price (£)
            <input
              value={priceText}
              onChange={(e) => setPriceText(e.target.value)}
              inputMode="numeric"
              className={`${inputClass} mt-1 font-normal`}
            />
          </label>
        </div>
        <p className="mt-1 text-xs text-cloudera-gray">
          {priceValid ? `Rent will be £${rentFromPrice(price)}. ` : ""}
          Hotels need a team to own every property in a colour group, so adding, deleting or
          recolouring properties changes which sets can be completed.
          {hasHistory
            ? " This property already has game history; price and colour changes apply straight away."
            : ""}
        </p>

        <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-cloudera-orange-dark">
          Location
        </h3>
        <div className="mt-2 flex gap-2">
          <input
            value={addressQuery}
            onChange={(e) => setAddressQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void searchAddress();
              }
            }}
            placeholder="Search an address or place…"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => void searchAddress()}
            disabled={addressBusy || addressQuery.trim().length < 3}
            className={smallBtn}
          >
            {addressBusy ? "Searching…" : "Search"}
          </button>
        </div>
        {addressResults && (
          <ul className="mt-2 space-y-1 text-sm">
            {addressResults.length === 0 && <li className="text-cloudera-gray">No results.</li>}
            {addressResults.map((r) => (
              <li key={`${r.latitude},${r.longitude}`}>
                <button
                  type="button"
                  onClick={() => {
                    setPosition(r.latitude, r.longitude);
                    setAddressResults(null);
                  }}
                  className="w-full rounded-lg border border-cloudera-border px-3 py-1.5 text-left hover:bg-cloudera-muted"
                >
                  {r.name}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3">
          <LocationPickerMapLazy
            latitude={coordsValid ? lat : defaultCenter.latitude}
            longitude={coordsValid ? lng : defaultCenter.longitude}
            onChange={setPosition}
            neighbours={mapNeighbours}
          />
          <p className="mt-1 text-xs text-cloudera-gray">
            Tap the map or drag the red pin to place it. Blue dots are the other properties on this board.
          </p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block text-xs font-semibold text-cloudera-navy">
            Latitude
            <input
              value={latText}
              onChange={(e) => setLatText(e.target.value)}
              onPaste={onCoordPaste}
              inputMode="decimal"
              className={`${inputClass} mt-1 font-normal`}
            />
          </label>
          <label className="block text-xs font-semibold text-cloudera-navy">
            Longitude
            <input
              value={lngText}
              onChange={(e) => setLngText(e.target.value)}
              onPaste={onCoordPaste}
              inputMode="decimal"
              className={`${inputClass} mt-1 font-normal`}
            />
          </label>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button type="button" onClick={useMyLocation} className={smallBtn}>
            Use my current location
          </button>
          <span className="text-xs text-cloudera-gray">
            Standing at the entrance? Use this. You can also paste &ldquo;lat, lng&rdquo; copied from Google Maps.
          </span>
        </div>
        {movedM != null && movedM > 0 && (
          <p className="mt-1 text-xs font-medium text-cloudera-navy">
            Moved {movedM >= 1000 ? `${(movedM / 1000).toFixed(2)} km` : `${movedM} m`} from the saved position.
          </p>
        )}

        <div className="mt-4 rounded-xl border border-cloudera-border bg-cloudera-muted/50 p-3">
          <p className="text-sm font-semibold text-cloudera-navy">Suggest from Wikidata</p>
          <p className="text-xs text-cloudera-gray">
            Looks up real places with coordinates and photos. Matches are suggestions only; check
            each one is the right place before applying it.
          </p>
          <div className="mt-2 flex gap-2">
            <input
              value={wikiQuery}
              onChange={(e) => setWikiQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void searchWikidata();
                }
              }}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => void searchWikidata()}
              disabled={wikiBusy || wikiQuery.trim().length < 2}
              className={smallBtn}
            >
              {wikiBusy ? "Searching…" : "Search"}
            </button>
          </div>
          {wikiResults && (
            <ul className="mt-2 space-y-2">
              {wikiResults.length === 0 && (
                <li className="text-sm text-cloudera-gray">
                  Nothing found nearby. Place the pin by hand and upload a photo instead.
                </li>
              )}
              {wikiResults.map((s) => (
                <li key={s.id} className="rounded-lg border border-cloudera-border bg-white p-2 text-sm">
                  <div className="font-semibold text-cloudera-navy">{s.label}</div>
                  <div className="text-xs text-cloudera-gray">
                    {s.description || "No description"}
                    {s.distanceM != null &&
                      ` · ${s.distanceM >= 1000 ? `${(s.distanceM / 1000).toFixed(1)} km` : `${s.distanceM} m`} from the pin`}
                    {s.imageFile ? " · has photo" : " · no photo"}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    <button type="button" onClick={() => applySuggestion(s, false)} className={smallBtn}>
                      Use location
                    </button>
                    {s.imageFile && (
                      <button type="button" onClick={() => applySuggestion(s, true)} className={smallBtn}>
                        Use location + photo
                      </button>
                    )}
                    <a
                      href={`https://www.wikidata.org/wiki/${s.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-1 py-1.5 text-xs font-semibold text-cloudera-orange-dark underline"
                    >
                      View on Wikidata
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-cloudera-orange-dark">
          Reference photo
        </h3>
        <div className="mt-2 flex flex-wrap items-start gap-4">
          <LandmarkPhoto
            name={name || "property"}
            imageUrl={currentPhoto}
            className="h-32 w-48 rounded-xl object-cover"
          />
          <div className="flex flex-col gap-2">
            <input
              ref={uploadRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                void onFileChosen(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                void onFileChosen(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button type="button" onClick={() => uploadRef.current?.click()} className={smallBtn}>
              Upload photo
            </button>
            <button type="button" onClick={() => cameraRef.current?.click()} className={smallBtn}>
              Take photo
            </button>
            {currentPhoto && (
              <button type="button" onClick={() => setStaged({ kind: "clear" })} className={smallBtn}>
                Remove photo
              </button>
            )}
            {staged && staged.kind !== "clear" && (
              <button type="button" onClick={() => setStaged(null)} className={smallBtn}>
                Undo photo change
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-cloudera-border bg-cloudera-muted/50 p-3">
          <p className="text-sm font-semibold text-cloudera-navy">Search Wikimedia Commons photos</p>
          <div className="mt-2 flex gap-2">
            <input
              value={photoQuery}
              onChange={(e) => setPhotoQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void searchPhotos();
                }
              }}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => void searchPhotos()}
              disabled={photoBusy || photoQuery.trim().length < 2}
              className={smallBtn}
            >
              {photoBusy ? "Searching…" : "Search"}
            </button>
          </div>
          {photoResults && (
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {photoResults.length === 0 && (
                <p className="col-span-full text-sm text-cloudera-gray">No photos found.</p>
              )}
              {photoResults.map((p) => (
                <button
                  key={p.file}
                  type="button"
                  onClick={() => stageCommons(p.file)}
                  title={p.file}
                  className="overflow-hidden rounded-lg border-2 border-transparent hover:border-cloudera-orange-dark"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.thumbUrl} alt={p.file} className="h-20 w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <label className="mt-5 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={verified}
            onChange={(e) => setVerified(e.target.checked)}
            className="mt-0.5 h-5 w-5 accent-cloudera-orange-dark"
          />
          <span className="text-sm">
            <span className="block font-semibold text-cloudera-navy">Verified</span>
            <span className="text-xs text-cloudera-gray">
              Tick once you have checked that the pin is at the real entrance and the photo shows the right place.
            </span>
          </span>
        </label>

        {note && <p className="mt-3 text-sm font-medium text-emerald-700">{note}</p>}
        {error && (
          <p className="mt-3 text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          {mode === "edit" ? (
            <button
              type="button"
              onClick={() => void remove()}
              disabled={busy}
              className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
            >
              Delete property
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} disabled={busy} className={smallBtn}>
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void save()}
              disabled={busy}
              className="btn-primary rounded-xl px-5 py-2 text-sm disabled:opacity-60"
            >
              {busy ? "Saving…" : mode === "create" ? "Add property" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
