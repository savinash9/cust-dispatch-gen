import { describe, expect, it } from "vitest";
import { normalizeMeetings } from "@/lib/aircover";

const payload = [
  {
    id: "m1",
    title: "Acme Corp - POC Review",
    start: "2024-01-10T16:00:00Z",
    end: "2024-01-10T17:00:00Z",
    organizer: { name: "Host", email: "host@example.com" },
    attendees: [{ name: "Jane", email: "jane@acme.com" }],
    notes: "Discussed security and architecture",
    meetingLink: "https://meet.example.com"
  }
];

describe("normalizeMeetings", () => {
  it("maps meeting fields and calculates duration", () => {
    const meetings = normalizeMeetings(payload);
    expect(meetings[0].durationMinutes).toBe(60);
    expect(meetings[0].accountName).toContain("Acme");
    expect(meetings[0].attendees[0].email).toBe("jane@acme.com");
  });
});
