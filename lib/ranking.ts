import { FocusCustomer, Meeting } from "./types";
import { extractKeywords } from "./aircover";

export function buildFocusCustomers(meetings: Meeting[]): FocusCustomer[] {
  const grouped: Record<string, Meeting[]> = {};
  meetings.forEach((meeting) => {
    if (!grouped[meeting.accountName]) {
      grouped[meeting.accountName] = [];
    }
    grouped[meeting.accountName].push(meeting);
  });

  const scores = Object.entries(grouped).map(([accountName, accountMeetings]) => {
    const meetingCount = accountMeetings.length;
    const totalAttendees = accountMeetings.reduce((acc, meeting) => acc + meeting.attendees.length, 0);
    const totalMinutes = accountMeetings.reduce((acc, meeting) => acc + meeting.durationMinutes, 0);
    const latest = Math.max(...accountMeetings.map((meeting) => new Date(meeting.start).getTime()));
    const keywordMatches = accountMeetings.flatMap((meeting) =>
      extractKeywords(`${meeting.title} ${meeting.notes ?? ""}`)
    );
    const keywordScore = new Set(keywordMatches).size * 10;
    const recencyScore = (Date.now() - latest) / (1000 * 60 * 60 * 24) * -1;
    const score = meetingCount * 20 + totalAttendees * 5 + totalMinutes * 0.5 + keywordScore + recencyScore;
    return {
      accountName,
      meetings: accountMeetings,
      score,
      meetingCount,
      totalAttendees,
      totalMinutes,
      keywordMatches: Array.from(new Set(keywordMatches))
    };
  });

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => ({
      accountName: item.accountName,
      inferred: item.meetings.some((meeting) => meeting.accountInferred),
      meetingCount: item.meetingCount,
      totalAttendees: item.totalAttendees,
      totalMinutes: item.totalMinutes,
      keywords: item.keywordMatches,
      detail: {
        callType: "Discovery",
        narrative: buildNarrative(item.accountName, item.meetings),
        proofPoints: buildProofPoints(item.meetings),
        risks: [],
        nextSteps: buildNextSteps(item.meetings)
      }
    }));
}

function buildNarrative(accountName: string, meetings: Meeting[]) {
  const keyMeeting = meetings[0];
  const duration = keyMeeting?.durationMinutes ?? 0;
  const attendees = keyMeeting?.attendees.length ?? 0;
  const notes = keyMeeting?.notes ?? "";
  const summary = notes ? `Highlights included ${notes.split("\n")[0]}.` : "";

  return (
    `The SE team met with ${accountName} to align on priorities and map the technical journey. ` +
    `Sessions totaled ${duration} minutes with ${attendees} attendees, covering requirements, success metrics, and competitive context. ` +
    `${summary} The team captured pain points, discussed integration expectations, and confirmed next steps.`
  );
}

function buildProofPoints(meetings: Meeting[]) {
  const keywords = meetings.flatMap((meeting) => extractKeywords(`${meeting.title} ${meeting.notes ?? ""}`));
  const unique = Array.from(new Set(keywords));
  if (unique.length === 0) {
    return ["Product architecture overview", "Security posture walkthrough", "Deployment timeline alignment"];
  }
  return unique.map((keyword) => `Validated ${keyword} requirements and alignment`);
}

function buildNextSteps(meetings: Meeting[]) {
  const nextMeeting = meetings[0];
  return [
    {
      date: nextMeeting?.end?.split("T")[0],
      action: "Send recap and technical requirements summary",
      owner: "SE"
    },
    {
      date: nextMeeting?.end?.split("T")[0],
      action: "Schedule architecture deep dive",
      owner: "AE"
    }
  ];
}
