import { createAdminSession, getAdminPassword } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({ password: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }
    if (parsed.data.password !== getAdminPassword()) {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
    }
    await createAdminSession(request);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Login failed";
    console.error("[admin/login]", e);
    return NextResponse.json(
      {
        error:
          message === "AUTH_SECRET is not configured"
            ? "Server misconfigured: set AUTH_SECRET in .env and restart the app."
            : "Server error during login. Check the terminal logs.",
      },
      { status: 500 },
    );
  }
}
