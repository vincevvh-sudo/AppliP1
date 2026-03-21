import { NextRequest, NextResponse } from "next/server";

const DEFAULT_CODE = "14021490";
const DEFAULT_SESSION_TOKEN = "enseignant-session-dev";

function getCode(): string {
  return (process.env.ENSEIGNANT_CODE ?? DEFAULT_CODE).trim();
}

function getSessionToken(): string {
  return (process.env.ENSEIGNANT_SESSION_TOKEN ?? DEFAULT_SESSION_TOKEN).trim();
}

export async function POST(request: NextRequest) {
  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide" }, { status: 400 });
  }

  const entered = String(body?.code ?? "").replace(/\s/g, "");
  const expected = getCode();

  if (entered.length !== 8 || entered !== expected) {
    return NextResponse.json({ ok: false, error: "Code incorrect" }, { status: 401 });
  }

  const token = getSessionToken();
  const isProduction = process.env.NODE_ENV === "production";
  const response = NextResponse.json({ ok: true });
  response.cookies.set("enseignant_ok", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/enseignant",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  });

  return response;
}
