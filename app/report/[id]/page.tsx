"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Badge, Button, Card, SecondaryButton, Textarea } from "@/components/ui";
import type { FocusCustomer, Meeting } from "@/lib/types";

type ReportResponse = {
  id: string;
  startDate: string;
  endDate: string;
  timezone: string;
  executiveSummary: string;
  focusCustomers: FocusCustomer[];
  sourceMeetings: Meeting[];
};

export default function ReportPage({ params }: { params: { id: string } }) {
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [edited, setEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const isShare = searchParams.get("mode") === "share";
  const aiAvailable = process.env.NEXT_PUBLIC_OPENAI_AVAILABLE === "true";

  useEffect(() => {
    const loadReport = async () => {
      try {
        const response = await fetch(`/api/report/${params.id}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load report");
        }
        setReport({
          ...data.report,
          startDate: data.report.startDate,
          endDate: data.report.endDate
        });
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [params.id]);

  const stats = useMemo(() => {
    if (!report) return null;
    const totalMeetings = report.sourceMeetings.length;
    const totalMinutes = report.sourceMeetings.reduce((acc, meeting) => acc + meeting.durationMinutes, 0);
    const accountCounts: Record<string, number> = {};
    const accountMinutes: Record<string, number> = {};
    report.sourceMeetings.forEach((meeting) => {
      accountCounts[meeting.accountName] = (accountCounts[meeting.accountName] ?? 0) + 1;
      accountMinutes[meeting.accountName] = (accountMinutes[meeting.accountName] ?? 0) + meeting.durationMinutes;
    });
    const topAccounts = Object.entries(accountCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);
    const meetingsChart = Object.entries(accountCounts).map(([name, count]) => ({ name, value: count }));
    const minutesChart = Object.entries(accountMinutes).map(([name, value]) => ({ name, value }));
    return { totalMeetings, totalMinutes, topAccounts, meetingsChart, minutesChart };
  }, [report]);

  const handleSave = async () => {
    if (!report) return;
    setSaving(true);
    await fetch(`/api/report/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        executiveSummary: report.executiveSummary,
        focusCustomers: report.focusCustomers
      })
    });
    setSaving(false);
    setEdited(false);
  };

  useEffect(() => {
    if (!edited || isShare || !report) return;
    const timeout = setTimeout(() => {
      handleSave();
    }, 1500);
    return () => clearTimeout(timeout);
  }, [edited, isShare, report]);

  const handlePolish = async () => {
    if (!report) return;
    setPolishing(true);
    try {
      const response = await fetch("/api/ai/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: report.executiveSummary })
      });
      const data = await response.json();
      if (response.ok && data.polished) {
        setReport({ ...report, executiveSummary: data.polished });
        setEdited(true);
      }
    } finally {
      setPolishing(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-sm text-slate-500">Loading report...</div>;
  }

  if (error || !report) {
    return <div className="p-10 text-sm text-rose-600">{error ?? "Report not found"}</div>;
  }

  const weekLabel = `Week of ${format(new Date(report.startDate), "MMM d, yyyy")} - ${format(
    new Date(report.endDate),
    "MMM d, yyyy"
  )}`;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500">SE Customer Dispatch Template</p>
          <h1 className="text-3xl font-semibold text-slate-900">Solutions Engineering Weekly Report</h1>
          <p className="text-sm text-slate-600">{weekLabel}</p>
        </header>

        {stats ? (
          <Card>
            <div className="grid gap-6 md:grid-cols-4">
              <div>
                <p className="text-xs uppercase text-slate-500">Date Range</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {format(new Date(report.startDate), "MMM d")} - {format(new Date(report.endDate), "MMM d")}
                </p>
                <Badge>{report.timezone}</Badge>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Total Meetings</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{stats.totalMeetings}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Total Minutes</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{stats.totalMinutes}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Top Accounts</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {stats.topAccounts.map((account) => (
                    <Badge key={account}>{account}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-slate-500">Meetings by Account</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.meetingsChart}>
                      <XAxis dataKey="name" hide />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Minutes by Account</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.minutesChart}>
                      <XAxis dataKey="name" hide />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </Card>
        ) : null}

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Narrative Intelligence</h2>
              <p className="text-sm text-slate-600">
                Executive summary and narratives are generated deterministically from meeting context.
              </p>
            </div>
            {aiAvailable && !isShare ? (
              <Button onClick={handlePolish} disabled={polishing}>
                {polishing ? "Polishing..." : "AI polish executive summary"}
              </Button>
            ) : null}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Executive Summary</h2>
            <Badge>{edited ? "Edited" : "Generated"}</Badge>
          </div>
          <Textarea
            className="mt-3 min-h-[120px]"
            value={report.executiveSummary}
            readOnly={isShare}
            onChange={(event) => {
              setReport({ ...report, executiveSummary: event.target.value });
              setEdited(true);
            }}
          />
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Focus Customers</h2>
            <Badge>{report.focusCustomers.length} Accounts</Badge>
          </div>
          <div className="mt-6 space-y-6">
            {report.focusCustomers.map((customer, index) => (
              <div key={customer.accountName} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {customer.accountName} {customer.segment ? `· ${customer.segment}` : ""}
                    </p>
                    {customer.inferred ? <p className="text-xs text-amber-600">Inferred account</p> : null}
                  </div>
                  <Badge>{customer.meetingCount} meetings</Badge>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">ARR (Net incremental)</label>
                    <Textarea
                      value={customer.arr ?? ""}
                      readOnly={isShare}
                      onChange={(event) => {
                        const next = [...report.focusCustomers];
                        next[index] = { ...customer, arr: event.target.value };
                        setReport({ ...report, focusCustomers: next });
                        setEdited(true);
                      }}
                      className="mt-1 min-h-[48px]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Company Background & Context</label>
                    <Textarea
                      value={customer.background ?? ""}
                      readOnly={isShare}
                      onChange={(event) => {
                        const next = [...report.focusCustomers];
                        next[index] = { ...customer, background: event.target.value };
                        setReport({ ...report, focusCustomers: next });
                        setEdited(true);
                      }}
                      className="mt-1 min-h-[48px]"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-xs font-semibold text-slate-600">Engagement Status & Use Case</label>
                  <Textarea
                    value={customer.engagementStatus ?? ""}
                    readOnly={isShare}
                    onChange={(event) => {
                      const next = [...report.focusCustomers];
                      next[index] = { ...customer, engagementStatus: event.target.value };
                      setReport({ ...report, focusCustomers: next });
                      setEdited(true);
                    }}
                    className="mt-1 min-h-[80px]"
                  />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Core Sales Team</label>
                    <Textarea
                      value={customer.coreTeam?.ae ?? ""}
                      readOnly={isShare}
                      onChange={(event) => {
                        const next = [...report.focusCustomers];
                        next[index] = {
                          ...customer,
                          coreTeam: { ...customer.coreTeam, ae: event.target.value }
                        };
                        setReport({ ...report, focusCustomers: next });
                        setEdited(true);
                      }}
                      className="mt-1 min-h-[48px]"
                      placeholder="AE, SE, Field CTO, FDE"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Key Customer Personas</label>
                    <Textarea
                      value={customer.personas?.champion ?? ""}
                      readOnly={isShare}
                      onChange={(event) => {
                        const next = [...report.focusCustomers];
                        next[index] = {
                          ...customer,
                          personas: { ...customer.personas, champion: event.target.value }
                        };
                        setReport({ ...report, focusCustomers: next });
                        setEdited(true);
                      }}
                      className="mt-1 min-h-[48px]"
                      placeholder="Champion, technical stakeholders, economic buyer"
                    />
                  </div>
                </div>
                <div className="mt-4 report-section space-y-3">
                  <h3>Demo/Call Highlights</h3>
                  <Textarea
                    value={customer.detail?.narrative ?? ""}
                    readOnly={isShare}
                    onChange={(event) => {
                      const next = [...report.focusCustomers];
                      next[index] = {
                        ...customer,
                        detail: { ...customer.detail, narrative: event.target.value }
                      };
                      setReport({ ...report, focusCustomers: next });
                      setEdited(true);
                    }}
                    className="min-h-[120px]"
                  />
                  <h4>Technical Proof Points Delivered</h4>
                  <Textarea
                    value={(customer.detail?.proofPoints ?? []).join("\n")}
                    readOnly={isShare}
                    onChange={(event) => {
                      const next = [...report.focusCustomers];
                      next[index] = {
                        ...customer,
                        detail: {
                          ...customer.detail,
                          proofPoints: event.target.value.split("\n").filter(Boolean)
                        }
                      };
                      setReport({ ...report, focusCustomers: next });
                      setEdited(true);
                    }}
                    className="min-h-[80px]"
                  />
                  <h4>Risks/Blockers</h4>
                  <Textarea
                    value={(customer.detail?.risks ?? []).join("\n")}
                    readOnly={isShare}
                    onChange={(event) => {
                      const next = [...report.focusCustomers];
                      next[index] = {
                        ...customer,
                        detail: {
                          ...customer.detail,
                          risks: event.target.value.split("\n").filter(Boolean)
                        }
                      };
                      setReport({ ...report, focusCustomers: next });
                      setEdited(true);
                    }}
                    className="min-h-[60px]"
                  />
                  <h4>Next Steps & Timeline</h4>
                  <Textarea
                    value={(customer.detail?.nextSteps ?? [])
                      .map((step) => `${step.date ?? ""} - ${step.action} (${step.owner ?? ""})`)
                      .join("\n")}
                    readOnly={isShare}
                    onChange={(event) => {
                      const next = [...report.focusCustomers];
                      next[index] = {
                        ...customer,
                        detail: {
                          ...customer.detail,
                          nextSteps: event.target.value
                            .split("\n")
                            .filter(Boolean)
                            .map((line) => {
                              const [datePart, rest] = line.split("-");
                              const actionPart = rest?.split("(")[0]?.trim();
                              const owner = rest?.split("(")[1]?.replace(")", "").trim();
                              return {
                                date: datePart?.trim(),
                                action: actionPart ?? line,
                                owner
                              };
                            })
                        }
                      };
                      setReport({ ...report, focusCustomers: next });
                      setEdited(true);
                    }}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Export & Share</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={`/api/report/${report.id}/pdf`} target="_blank">
              <SecondaryButton>Export PDF</SecondaryButton>
            </Link>
            <Link href={`/api/report/${report.id}/markdown`} target="_blank">
              <SecondaryButton>Export Markdown</SecondaryButton>
            </Link>
            {!isShare ? (
              <SecondaryButton
                onClick={async () => {
                  const response = await fetch(`/api/report/${report.id}/share`, { method: "POST" });
                  const data = await response.json();
                  if (data.url) {
                    await navigator.clipboard.writeText(`${window.location.origin}${data.url}`);
                  }
                }}
              >
                Copy Shareable Link
              </SecondaryButton>
            ) : null}
          </div>
        </Card>

        {!isShare ? (
          <div className="flex justify-end gap-3">
            <SecondaryButton onClick={() => setReport({ ...report })}>Reset</SecondaryButton>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Updates"}
            </Button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
