"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input } from "@/components/ui";
import { timezones, toIsoInZone } from "@/lib/time";

export default function HomePage() {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [timezone, setTimezone] = useState("America/Denver");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: toIsoInZone(startDate, timezone),
          endDate: toIsoInZone(endDate, timezone),
          timezone
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to generate report.");
      }
      router.push(`/report/${data.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500">Customer Dispatch Generator</p>
          <h1 className="text-4xl font-semibold text-slate-900">Generate a weekly SE dispatch report</h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600">
            Pull meeting activity from Aircover, curate focus customers, and deliver an executive-ready dispatch in minutes.
          </p>
        </div>
        <Card>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <label className="text-sm font-semibold text-slate-700">Meeting Start Date</label>
              <Input type="datetime-local" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Meeting End Date</label>
              <Input type="datetime-local" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Timezone</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
              >
                {timezones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
          <div className="mt-6 flex items-center justify-end">
            <Button onClick={handleGenerate} disabled={loading || !startDate || !endDate}>
              {loading ? "Generating..." : "Generate Dispatch"}
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
