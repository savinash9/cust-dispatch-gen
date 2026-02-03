import { NextResponse } from "next/server";
import { loginAircover } from "@/lib/aircoverClient";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limit = rateLimit(`login-${ip}`);
  if (!limit.ok) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const token = await loginAircover();
    const response = NextResponse.json({ ok: true });
    response.headers.set("Set-Cookie", `aircover_token=${token}; HttpOnly; Path=/; Max-Age=3600`);
    return response;
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 });
  }
}
