import { distanceMeters } from "@/lib/geo";

const USER_AGENT =
  "MonopolyRun/1.0 (https://github.com/markysamson/CursorTest; admin landmark lookup)";

const WIKIDATA_API = "https://www.wikidata.org/w/api.php";
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Wikimedia answers rate-limited requests with plain text, so retry with backoff. */
async function getJson<T>(url: string): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
        cache: "no-store",
      });
      const text = await res.text();
      return JSON.parse(text) as T;
    } catch (error) {
      lastError = error;
      await sleep(1500 * (attempt + 1));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Wikimedia request failed");
}

export type PlaceCandidate = {
  id: string;
  label: string;
  description: string;
  latitude: number;
  longitude: number;
  /** Commons file name of the place's main photo (Wikidata P18), when it has one. */
  imageFile: string | null;
  /** Distance from the reference point, when one was supplied. */
  distanceM: number | null;
};

type WikidataSearchResponse = {
  search?: { id: string; label?: string; description?: string }[];
};

type WikidataEntitiesResponse = {
  entities?: Record<
    string,
    {
      labels?: { en?: { value: string } };
      descriptions?: { en?: { value: string } };
      claims?: {
        P625?: { mainsnak?: { datavalue?: { value?: { latitude: number; longitude: number } } } }[];
        P18?: { mainsnak?: { datavalue?: { value?: string } } }[];
      };
    }
  >;
};

function normalise(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function nameScore(label: string, query: string): number {
  const a = normalise(label);
  const b = normalise(query);
  if (!a || !b) return 0;
  if (a === b) return 2;
  if (a.includes(b) || b.includes(a)) return 1;
  return 0;
}

/**
 * Look up real places by name. Candidates without coordinates are dropped, and when a
 * reference point is given anything further away than `maxDistanceM` is dropped too, so
 * a search for a village pub cannot return a namesake in another county.
 */
export async function searchWikidataPlaces(
  query: string,
  near?: { latitude: number; longitude: number },
  maxDistanceM = 40_000,
): Promise<PlaceCandidate[]> {
  const q = query.trim();
  if (!q) return [];

  const search = await getJson<WikidataSearchResponse>(
    `${WIKIDATA_API}?${new URLSearchParams({
      action: "wbsearchentities",
      format: "json",
      language: "en",
      uselang: "en",
      limit: "10",
      search: q,
    })}`,
  );
  const ids = (search.search ?? []).map((hit) => hit.id);
  if (ids.length === 0) return [];

  const entities = await getJson<WikidataEntitiesResponse>(
    `${WIKIDATA_API}?${new URLSearchParams({
      action: "wbgetentities",
      format: "json",
      props: "claims|labels|descriptions",
      languages: "en",
      ids: ids.join("|"),
    })}`,
  );

  const candidates: PlaceCandidate[] = [];
  for (const id of ids) {
    const entity = entities.entities?.[id];
    const coords = entity?.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
    if (!entity || !coords) continue;

    const distanceM = near
      ? Math.round(distanceMeters(near.latitude, near.longitude, coords.latitude, coords.longitude))
      : null;
    if (distanceM != null && distanceM > maxDistanceM) continue;

    candidates.push({
      id,
      label: entity.labels?.en?.value ?? id,
      description: entity.descriptions?.en?.value ?? "",
      latitude: coords.latitude,
      longitude: coords.longitude,
      imageFile: entity.claims?.P18?.[0]?.mainsnak?.datavalue?.value ?? null,
      distanceM,
    });
  }

  return candidates
    .map((c, index) => ({ c, index, score: nameScore(c.label, q) }))
    .sort(
      (x, y) =>
        y.score - x.score ||
        (x.c.distanceM ?? 0) - (y.c.distanceM ?? 0) ||
        x.index - y.index,
    )
    .map((x) => x.c)
    .slice(0, 5);
}

export type CommonsPhoto = {
  file: string;
  thumbUrl: string;
  pageUrl: string;
};

type CommonsSearchResponse = {
  query?: {
    pages?: Record<
      string,
      {
        title: string;
        index?: number;
        imageinfo?: { thumburl?: string; mime?: string }[];
      }
    >;
  };
};

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function searchCommonsPhotos(query: string): Promise<CommonsPhoto[]> {
  const q = query.trim();
  if (!q) return [];

  const data = await getJson<CommonsSearchResponse>(
    `${COMMONS_API}?${new URLSearchParams({
      action: "query",
      format: "json",
      generator: "search",
      gsrsearch: `${q} filetype:bitmap`,
      gsrnamespace: "6",
      gsrlimit: "16",
      prop: "imageinfo",
      iiprop: "url|mime",
      iiurlwidth: "240",
    })}`,
  );

  return Object.values(data.query?.pages ?? {})
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .flatMap((page) => {
      const info = page.imageinfo?.[0];
      if (!info?.thumburl || !info.mime || !ALLOWED_MIME.has(info.mime)) return [];
      const file = page.title.replace(/^File:/i, "");
      return [
        {
          file,
          thumbUrl: info.thumburl,
          pageUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}`,
        },
      ];
    });
}

export type GeocodeResult = {
  name: string;
  latitude: number;
  longitude: number;
};

type NominatimResult = { display_name: string; lat: string; lon: string };

/** Address / place search via OpenStreetMap Nominatim (admin-initiated, low volume). */
export async function geocodeAddress(
  query: string,
  near?: { latitude: number; longitude: number },
): Promise<GeocodeResult[]> {
  const q = query.trim();
  if (!q) return [];

  const params = new URLSearchParams({ format: "jsonv2", limit: "5", q });
  if (near) {
    const d = 0.25;
    params.set(
      "viewbox",
      `${near.longitude - d},${near.latitude + d},${near.longitude + d},${near.latitude - d}`,
    );
  }

  const results = await getJson<NominatimResult[]>(
    `https://nominatim.openstreetmap.org/search?${params}`,
  );
  return (Array.isArray(results) ? results : [])
    .map((r) => ({
      name: r.display_name,
      latitude: Number(r.lat),
      longitude: Number(r.lon),
    }))
    .filter((r) => Number.isFinite(r.latitude) && Number.isFinite(r.longitude));
}
