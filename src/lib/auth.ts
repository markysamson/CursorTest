import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_ADMIN = "monopoly_admin_session";
const COOKIE_TEAM = "monopoly_team_session";

function getSecret() {
  const secret =
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === "development" ? "dev-only-insecure-secret" : undefined);
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}

/** Use HTTPS (or opt-in) for Secure cookies — plain http://localhost breaks login with npm start. */
export function shouldUseSecureCookies(request?: Request): boolean {
  if (process.env.COOKIE_SECURE === "true") return true;
  if (process.env.COOKIE_SECURE === "false") return false;
  if (!request) return false;
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() === "https";
  }
  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return false;
  }
}

export type AdminSession = { role: "admin" };
export type TeamSession = { role: "team"; teamId: string; gameId: string };

export async function hashPin(pin: string) {
  return bcrypt.hash(pin, 10);
}

export async function verifyPin(pin: string, hash: string) {
  return bcrypt.compare(pin, hash);
}

export async function createAdminSession(request?: Request) {
  const token = await new SignJWT({ role: "admin" satisfies AdminSession["role"] })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getSecret());
  const jar = await cookies();
  jar.set(COOKIE_ADMIN, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookies(request),
    path: "/",
  });
}

export async function createTeamSession(teamId: string, gameId: string, request?: Request) {
  const token = await new SignJWT({
    role: "team",
    teamId,
    gameId,
  } satisfies TeamSession)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getSecret());
  const jar = await cookies();
  jar.set(COOKIE_TEAM, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookies(request),
    path: "/",
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE_ADMIN);
}

export async function clearTeamSession() {
  const jar = await cookies();
  jar.delete(COOKIE_TEAM);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_ADMIN)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== "admin") return null;
    return { role: "admin" };
  } catch {
    return null;
  }
}

export async function getTeamSession(): Promise<TeamSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_TEAM)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== "team" || typeof payload.teamId !== "string") return null;
    if (typeof payload.gameId !== "string") return null;
    return { role: "team", teamId: payload.teamId, gameId: payload.gameId };
  } catch {
    return null;
  }
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "monopoly-admin";
}
