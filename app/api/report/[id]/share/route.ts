import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const report = await prisma.report.findUnique({ where: { id: params.id } });
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json({
    shareId: report.id,
    url: `/report/${report.id}?mode=share`
  });
}
