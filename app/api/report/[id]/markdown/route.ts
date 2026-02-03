import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { format } from "date-fns";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const report = await prisma.report.findUnique({ where: { id: params.id } });
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const weekLabel = `Week of ${format(report.startDate, "MMM d, yyyy")} - ${format(report.endDate, "MMM d, yyyy")}`;
  const focusCustomers = report.focusCustomers as any[];
  const focusSections = focusCustomers
    .map(
      (customer) =>
        `### ${customer.accountName}\n\n${customer.detail?.narrative ?? ""}\n\n**Proof Points**\n${(
          customer.detail?.proofPoints ?? []
        )
          .map((item: string) => `- ${item}`)
          .join("\n")}`
    )
    .join("\n\n");

  const markdown = `# SE Customer Dispatch Template\n\n## Solutions Engineering Weekly Report\n\n${weekLabel}\n\n## Executive Summary\n\n${report.executiveSummary}\n\n## Focus Customers\n\n${focusSections}`;

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown",
      "Content-Disposition": `attachment; filename=dispatch-${report.id}.md`
    }
  });
}
