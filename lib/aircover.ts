import { z } from "zod";
import { Meeting } from "./types";

const attendeeSchema = z.object({
  name: z.string().optional().default(""),
  email: z.string().email().optional().default("")
});

const meetingSchema = z.object({
  id: z.string(),
  title: z.string().default("Untitled Meeting"),
  start: z.string(),
  end: z.string(),
  organizer: z.object({
    name: z.string().optional().default(""),
    email: z.string().optional().default("")
  }),
  attendees: z.array(attendeeSchema).default([]),
  notes: z.string().optional().default(""),
  summary: z.string().optional().default(""),
  description: z.string().optional().default(""),
  transcript: z.string().optional().default(""),
  meetingLink: z.string().optional().default("")
});

export type AircoverMeeting = z.infer<typeof meetingSchema>;

const keywordList = [
  "poc",
  "security",
  "sso",
  "scim",
  "procurement",
  "architecture",
  "pilot",
  "renewal",
  "competitive",
  "rival",
  "incumbent",
  "demo",
  "deep dive",
  "review"
];

function inferAccountName(title: string, attendees: AircoverMeeting["attendees"]) {
  const domainCounts: Record<string, number> = {};
  attendees.forEach((attendee) => {
    const domain = attendee.email.split("@")[1];
    if (domain) {
      const key = domain.split(".")[0];
      domainCounts[key] = (domainCounts[key] ?? 0) + 1;
    }
  });
  const sorted = Object.entries(domainCounts).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0) {
    return { accountName: sorted[0][0], inferred: true };
  }
  const titleMatch = title.split("-")[0]?.trim();
  if (titleMatch) {
    return { accountName: titleMatch, inferred: true };
  }
  return { accountName: "Unknown", inferred: true };
}

export function normalizeMeetings(payload: unknown): Meeting[] {
  const meetings = z.array(meetingSchema).parse(payload);
  return meetings.map((meeting) => {
    const durationMinutes = Math.max(
      0,
      Math.round((new Date(meeting.end).getTime() - new Date(meeting.start).getTime()) / 60000)
    );
    const summary = [meeting.notes, meeting.summary, meeting.description, meeting.transcript]
      .filter(Boolean)
      .join("\n");

    const accountFromTitle = meeting.title.match(/\b([A-Z][A-Za-z0-9&\s]+)\b/);
    const inferredAccount = accountFromTitle?.[1];
    const account = inferredAccount
      ? { accountName: inferredAccount.trim(), inferred: true }
      : inferAccountName(meeting.title, meeting.attendees);

    return {
      id: meeting.id,
      title: meeting.title,
      start: meeting.start,
      end: meeting.end,
      durationMinutes,
      organizer: {
        name: meeting.organizer.name ?? "",
        email: meeting.organizer.email ?? ""
      },
      attendees: meeting.attendees.map((attendee) => ({
        name: attendee.name ?? attendee.email,
        email: attendee.email
      })),
      accountName: account.accountName,
      accountInferred: account.inferred,
      notes: summary,
      meetingLink: meeting.meetingLink
    };
  });
}

export function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return keywordList.filter((keyword) => lower.includes(keyword));
}
