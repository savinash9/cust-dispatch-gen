import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ReportPdf } from "@/lib/pdf";
import { renderToStream } from "@react-pdf/renderer";
import { format } from "date-fns";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const report = await prisma.report.findUnique({ where: { id: params.id } });
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const weekLabel = `Week of ${format(report.startDate, "MMM d, yyyy")} - ${format(report.endDate, "MMM d, yyyy")}`;
  const pdfStream = await renderToStream(
    ReportPdf({
      title: "SE Customer Dispatch Template",
      weekLabel,
      summary: report.executiveSummary,
      focusCustomers: report.focusCustomers as any
    })
  );

  return new NextResponse(pdfStream as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=dispatch-${report.id}.pdf`
    }
  });
}
