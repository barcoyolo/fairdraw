export type AttendanceStatus = "yes" | "no" | "not_sure";
export type RegistrationSource = "preregistration" | "live" | "representative_entry";
export type EligibilityStatus = "valid" | "duplicate" | "rejected" | "pending";
export type ResultType = "winner" | "alternate";

export type EventRecord = {
  id: string;
  title: string;
  description: string;
  public_slug: string;
  winner_count: number;
  alternate_count: number;
  preregistration_opens_at: string;
  preregistration_closes_at: string;
  live_registration_closes_at: string;
  eligibility_rules: string;
  preregistration_open: boolean;
  live_registration_open: boolean;
  locked_at: string | null;
  final_participant_count: number | null;
  verification_hash: string | null;
  draw_executed_at: string | null;
  draw_admin_id: string | null;
  created_at: string;
};

export type ParticipantRecord = {
  id: string;
  event_id: string;
  entry_number: number;
  full_name: string;
  email: string;
  phone: string;
  city_state: string;
  attendance_status: AttendanceStatus | null;
  registration_source: RegistrationSource;
  representative_id: string | null;
  eligibility_status: EligibilityStatus;
  duplicate_reasons: string[] | null;
  created_at: string;
  updated_at: string;
};

export type RepresentativeRecord = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  relationship_to_participant: string;
  reason_participant_absent: string;
  created_at: string;
};

export type DrawResultRecord = {
  id: string;
  event_id: string;
  participant_id: string;
  rank: number;
  result_type: ResultType;
  drawn_at: string;
  participant?: ParticipantRecord;
};

export type EventStats = {
  preregistered: number;
  live: number;
  representative: number;
  valid: number;
  review: number;
  rejected: number;
};

export type PublicEventBundle = {
  event: EventRecord;
  participants: ParticipantRecord[];
  representatives: RepresentativeRecord[];
  results: DrawResultRecord[];
  stats: EventStats;
};
