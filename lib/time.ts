import { zonedTimeToUtc } from "date-fns-tz";

export const timezones = [
  "America/Denver",
  "America/Los_Angeles",
  "America/New_York",
  "UTC",
  "Europe/London"
];

export function toIsoInZone(value: string, zone: string) {
  if (!value) return "";
  const date = zonedTimeToUtc(value, zone);
  return date.toISOString();
}
