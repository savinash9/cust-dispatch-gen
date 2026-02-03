"use client";

import { useEffect, useState } from "react";
import { Button, Card, Input, Textarea } from "@/components/ui";

type AccountProfile = {
  id: string;
  accountName: string;
  segment?: string | null;
  industry?: string | null;
  arrRange?: string | null;
  qualifiers?: string | null;
  notes?: string | null;
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AccountProfile[]>([]);
  const [form, setForm] = useState({ accountName: "", segment: "", industry: "", arrRange: "", qualifiers: "", notes: "" });
  const [loading, setLoading] = useState(false);

  const loadAccounts = async () => {
    const response = await fetch("/api/accounts");
    const data = await response.json();
    setAccounts(data.accounts ?? []);
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setForm({ accountName: "", segment: "", industry: "", arrRange: "", qualifiers: "", notes: "" });
    await loadAccounts();
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500">Account Profiles</p>
          <h1 className="text-3xl font-semibold text-slate-900">Maintain customer context</h1>
        </header>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Add or update profile</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Account Name"
              value={form.accountName}
              onChange={(event) => setForm({ ...form, accountName: event.target.value })}
            />
            <Input
              placeholder="Segment"
              value={form.segment}
              onChange={(event) => setForm({ ...form, segment: event.target.value })}
            />
            <Input
              placeholder="Industry"
              value={form.industry}
              onChange={(event) => setForm({ ...form, industry: event.target.value })}
            />
            <Input
              placeholder="ARR Range"
              value={form.arrRange}
              onChange={(event) => setForm({ ...form, arrRange: event.target.value })}
            />
          </div>
          <div className="mt-4">
            <Textarea
              placeholder="Notable qualifiers / context"
              value={form.qualifiers}
              onChange={(event) => setForm({ ...form, qualifiers: event.target.value })}
            />
          </div>
          <div className="mt-4">
            <Textarea
              placeholder="Additional notes"
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSubmit} disabled={loading || !form.accountName}>
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          {accounts.map((account) => (
            <Card key={account.id}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{account.accountName}</h3>
                  <p className="text-sm text-slate-600">
                    {account.segment ?? "Segment"} · {account.industry ?? "Industry"}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">ARR Range: {account.arrRange ?? "N/A"}</p>
              <p className="mt-2 text-sm text-slate-600">Qualifiers: {account.qualifiers ?? "None"}</p>
              <p className="mt-2 text-sm text-slate-600">Notes: {account.notes ?? "None"}</p>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
