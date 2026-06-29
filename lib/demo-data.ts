import type { PublicEventBundle } from "@/lib/types";
import { summarizeStats } from "@/lib/utils";

const event = {
  id: "demo-event",
  title: "FairDraw Community Lottery",
  description: "Transparent community distribution for a public World Cup ticket giveaway.",
  public_slug: "world-cup-community-draw",
  winner_count: 3,
  alternate_count: 2,
  preregistration_opens_at: new Date(Date.now() - 86400000).toISOString(),
  preregistration_closes_at: new Date(Date.now() + 3600000).toISOString(),
  live_registration_closes_at: new Date(Date.now() + 7200000).toISOString(),
  eligibility_rules: "One entry per person. Participants must meet embassy/community eligibility rules.",
  preregistration_open: true,
  live_registration_open: true,
  locked_at: null,
  final_participant_count: null,
  verification_hash: "DEMO-VERIFY-2026",
  draw_executed_at: null,
  draw_admin_id: null,
  created_at: new Date().toISOString()
};

const participants = [
  {
    id: "p1",
    event_id: event.id,
    entry_number: 1001,
    full_name: "Jean Morel",
    email: "jean.morel@gmail.com",
    phone: "555-010-4242",
    city_state: "Miami, FL",
    attendance_status: "yes" as const,
    registration_source: "preregistration" as const,
    representative_id: null,
    eligibility_status: "valid" as const,
    duplicate_reasons: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "p2",
    event_id: event.id,
    entry_number: 1002,
    full_name: "Amara Silva",
    email: "amara@example.com",
    phone: "555-010-8181",
    city_state: "Atlanta, GA",
    attendance_status: "not_sure" as const,
    registration_source: "live" as const,
    representative_id: null,
    eligibility_status: "valid" as const,
    duplicate_reasons: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "p3",
    event_id: event.id,
    entry_number: 1003,
    full_name: "Jean M.",
    email: "jean.morel@gmail.com",
    phone: "555-010-4242",
    city_state: "Miami, FL",
    attendance_status: "no" as const,
    registration_source: "representative_entry" as const,
    representative_id: "r1",
    eligibility_status: "duplicate" as const,
    duplicate_reasons: ["Same email", "Same phone", "Similar full name"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const demoBundle: PublicEventBundle = {
  event,
  participants,
  representatives: [
    {
      id: "r1",
      full_name: "Marie Laurent",
      email: "marie@example.com",
      phone: null,
      relationship_to_participant: "Family member",
      reason_participant_absent: "Participant is traveling for work.",
      created_at: new Date().toISOString()
    }
  ],
  results: [],
  stats: summarizeStats(participants)
};
