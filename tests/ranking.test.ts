import { describe, expect, it } from "vitest";
import { buildFocusCustomers } from "@/lib/ranking";
import type { Meeting } from "@/lib/types";

const meetings: Meeting[] = [
  {
    id: "1",
    title: "Acme Security Review",
    start: "2024-02-01T10:00:00Z",
    end: "2024-02-01T11:00:00Z",
    durationMinutes: 60,
    organizer: { name: "Host", email: "host@example.com" },
    attendees: [{ name: "A", email: "a@acme.com" }],
    accountName: "Acme",
    accountInferred: false,
    notes: "Security review"
  },
  {
    id: "2",
    title: "Beta POC",
    start: "2024-02-02T10:00:00Z",
    end: "2024-02-02T10:30:00Z",
    durationMinutes: 30,
    organizer: { name: "Host", email: "host@example.com" },
    attendees: [{ name: "B", email: "b@beta.com" }, { name: "C", email: "c@beta.com" }],
    accountName: "Beta",
    accountInferred: false,
    notes: "POC planning"
  }
];

describe("buildFocusCustomers", () => {
  it("returns ranked focus customers", () => {
    const result = buildFocusCustomers(meetings);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].accountName).toBeDefined();
  });
});
