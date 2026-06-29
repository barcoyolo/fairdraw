import { createHash, randomInt } from "crypto";
import type { ParticipantRecord, EventRecord, EventStats } from "@/lib/types";

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ");
}

export function similarNameScore(a: string, b: string) {
  const left = normalizeName(a);
  const right = normalizeName(b);
  if (!left || !right) return 0;
  if (left === right) return 1;

  const leftParts = new Set(left.split(" "));
  const rightParts = new Set(right.split(" "));
  const shared = [...leftParts].filter((part) => rightParts.has(part)).length;
  return shared / Math.max(leftParts.size, rightParts.size);
}

export function detectDuplicateReasons(
  candidate: Pick<ParticipantRecord, "email" | "phone" | "full_name" | "representative_id">,
  participants: ParticipantRecord[]
) {
  const reasons = new Set<string>();
  const email = normalizeEmail(candidate.email);
  const phone = normalizePhone(candidate.phone);

  participants.forEach((participant) => {
    if (normalizeEmail(participant.email) === email) reasons.add("Same email");
    if (phone && normalizePhone(participant.phone) === phone) reasons.add("Same phone");
    if (similarNameScore(candidate.full_name, participant.full_name) >= 0.75) {
      reasons.add("Similar full name");
    }
  });

  if (candidate.representative_id) {
    const repCount = participants.filter(
      (participant) => participant.representative_id === candidate.representative_id
    ).length;
    if (repCount >= 4) reasons.add("Representative entering many people");
  }

  return [...reasons];
}

export function summarizeStats(participants: ParticipantRecord[]): EventStats {
  return {
    preregistered: participants.filter((p) => p.registration_source === "preregistration").length,
    live: participants.filter((p) => p.registration_source === "live").length,
    representative: participants.filter((p) => p.registration_source === "representative_entry").length,
    valid: participants.filter((p) => p.eligibility_status === "valid").length,
    review: participants.filter((p) => ["duplicate", "pending"].includes(p.eligibility_status)).length,
    rejected: participants.filter((p) => p.eligibility_status === "rejected").length
  };
}

export function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain) return "hidden";
  return `${name.slice(0, 2)}***@${domain}`;
}

export function maskPhone(phone: string) {
  const digits = normalizePhone(phone);
  return digits ? `phone ending in ${digits.slice(-2)}` : "phone hidden";
}

export function createVerificationHash(event: EventRecord, participants: ParticipantRecord[]) {
  const canonical = participants
    .filter((participant) => participant.eligibility_status === "valid")
    .sort((a, b) => a.entry_number - b.entry_number)
    .map((participant) => `${participant.entry_number}:${normalizeEmail(participant.email)}:${normalizePhone(participant.phone)}`)
    .join("|");

  return createHash("sha256")
    .update(`${event.id}:${event.public_slug}:${canonical}`)
    .digest("hex")
    .slice(0, 24)
    .toUpperCase();
}

export function drawParticipantIds(validParticipantIds: string[], winnerCount: number, alternateCount: number) {
  const pool = [...validParticipantIds];
  const selected: string[] = [];
  const needed = Math.min(pool.length, winnerCount + alternateCount);

  while (selected.length < needed) {
    const index = randomInt(pool.length);
    selected.push(pool[index]);
    pool.splice(index, 1);
  }

  return {
    winners: selected.slice(0, winnerCount),
    alternates: selected.slice(winnerCount)
  };
}

export function registrationWindow(event: EventRecord) {
  if (event.locked_at) return "Locked";
  if (event.live_registration_open) return "Live registration open";
  if (event.preregistration_open) return "Pre-registration open";
  return "Registration closed";
}

export function formatDateTime(value: string | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
