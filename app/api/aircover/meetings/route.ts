import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { fetchMeetings } from "@/lib/aircoverClient";

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limit = rateLimit(`meetings-${ip}`);
  if (!limit.ok) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  if (!start || !end) {
    return NextResponse.json({ error: "Missing start or end date" }, { status: 400 });
  }

  try {
    const data = await fetchMeetings(start, end);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
