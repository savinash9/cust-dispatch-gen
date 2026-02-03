import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const patchSchema = z.object({
  executiveSummary: z.string().optional(),
  focusCustomers: z.any().optional(),
  sections: z.any().optional()
});

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const report = await prisma.report.findUnique({ where: { id: params.id } });
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }
  return NextResponse.json({ report });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const payload = patchSchema.parse(body);
  const report = await prisma.report.update({
    where: { id: params.id },
    data: {
      executiveSummary: payload.executiveSummary,
      focusCustomers: payload.focusCustomers,
      sections: payload.sections
    }
  });
  return NextResponse.json({ report });
}
