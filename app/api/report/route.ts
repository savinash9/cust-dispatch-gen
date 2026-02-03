import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rateLimit";
import { fetchMeetings } from "@/lib/aircoverClient";
import { normalizeMeetings } from "@/lib/aircover";
import { buildFocusCustomers } from "@/lib/ranking";
import { generateExecutiveSummary } from "@/lib/narrative";
import { prisma } from "@/lib/db";

const payloadSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  timezone: z.string().default("America/Denver")
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limit = rateLimit(`report-${ip}`);
  if (!limit.ok) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { startDate, endDate, timezone } = payloadSchema.parse(body);
    const aircoverData = await fetchMeetings(startDate, endDate);
    const meetings = normalizeMeetings(aircoverData);
    const focusCustomers = buildFocusCustomers(meetings);
    const profiles = await prisma.accountProfile.findMany({
      where: { accountName: { in: focusCustomers.map((customer) => customer.accountName) } }
    });
    const enrichedFocus = focusCustomers.map((customer) => {
      const profile = profiles.find((item) => item.accountName === customer.accountName);
      if (!profile) return customer;
      return {
        ...customer,
        segment: profile.segment ?? undefined,
        arr: profile.arrRange ?? undefined,
        background: [profile.industry, profile.arrRange, profile.qualifiers].filter(Boolean).join(" · "),
        coreTeam: profile.coreTeam ?? undefined,
        personas: profile.personas ?? undefined
      };
    });
    const executiveSummary = generateExecutiveSummary(meetings);
    const report = await prisma.report.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        timezone,
        executiveSummary,
        focusCustomers: enrichedFocus,
        sections: { header: "SE Customer Dispatch Template" },
        sourceMeetings: meetings
      }
    });
    return NextResponse.json({ id: report.id });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
