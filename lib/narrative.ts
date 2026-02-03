import { Meeting } from "./types";

export function generateExecutiveSummary(meetings: Meeting[]) {
  if (meetings.length === 0) {
    return "No meetings were found for the selected range. Add notes or adjust the date range to generate a weekly dispatch.";
  }
  const totalMeetings = meetings.length;
  const totalMinutes = meetings.reduce((acc, meeting) => acc + meeting.durationMinutes, 0);
  const accountSet = new Set(meetings.map((meeting) => meeting.accountName));
  const accounts = Array.from(accountSet).slice(0, 3).join(", ");
  return (
    `This week featured ${totalMeetings} customer engagements totaling ${totalMinutes} minutes across ${accountSet.size} accounts. ` +
    `Key themes included solution alignment, technical discovery, and stakeholder consensus with ${accounts}. ` +
    `Follow-ups are focused on concrete next steps, validation of requirements, and continued momentum in active opportunities.`
  );
}
