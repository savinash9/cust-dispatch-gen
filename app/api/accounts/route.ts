import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const accountSchema = z.object({
  accountName: z.string(),
  segment: z.string().optional(),
  industry: z.string().optional(),
  arrRange: z.string().optional(),
  qualifiers: z.string().optional(),
  coreTeam: z.any().optional(),
  personas: z.any().optional(),
  notes: z.string().optional()
});

export async function GET() {
  const accounts = await prisma.accountProfile.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ accounts });
}

export async function POST(request: Request) {
  const body = await request.json();
  const payload = accountSchema.parse(body);
  const account = await prisma.accountProfile.upsert({
    where: { accountName: payload.accountName },
    update: payload,
    create: payload
  });
  return NextResponse.json({ account });
}
