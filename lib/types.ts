export type MeetingAttendee = {
  name: string;
  email: string;
};

export type MeetingOrganizer = {
  name: string;
  email: string;
};

export type Meeting = {
  id: string;
  title: string;
  start: string;
  end: string;
  durationMinutes: number;
  organizer: MeetingOrganizer;
  attendees: MeetingAttendee[];
  accountName: string;
  accountInferred: boolean;
  notes?: string;
  meetingLink?: string;
};

export type FocusCustomer = {
  accountName: string;
  segment?: string;
  arr?: string;
  inferred: boolean;
  meetingCount: number;
  totalAttendees: number;
  totalMinutes: number;
  keywords: string[];
  background?: string;
  engagementStatus?: string;
  coreTeam?: {
    ae?: string;
    se?: string;
    fieldCto?: string;
    fde?: string;
    other?: string;
  };
  personas?: {
    champion?: string;
    technical?: string;
    economicBuyer?: string;
    influencers?: string;
  };
  detail?: {
    callType?: string;
    narrative?: string;
    proofPoints?: string[];
    risks?: string[];
    nextSteps?: { date?: string; action: string; owner?: string }[];
  };
};

export type ReportPayload = {
  startDate: string;
  endDate: string;
  timezone: string;
  executiveSummary: string;
  focusCustomers: FocusCustomer[];
  sections: {
    header: string;
  };
  sourceMeetings: Meeting[];
};
