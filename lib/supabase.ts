import { createClient } from "@supabase/supabase-js";
import { demoBundle } from "@/lib/demo-data";
import type {
  DrawResultRecord,
  EventRecord,
  ParticipantRecord,
  PublicEventBundle,
  RepresentativeRecord
} from "@/lib/types";
import { summarizeStats } from "@/lib/utils";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const allowDemoMode = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_ENABLE_DEMO === "true";

export const isSupabaseConfigured = Boolean(supabaseUrl && (anonKey || serviceKey));

export function getSupabaseAdmin() {
  const serverKey = serviceKey || anonKey;
  if (!supabaseUrl || !serverKey) return null;
  return createClient(supabaseUrl, serverKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export function getSupabaseBrowser() {
  if (!supabaseUrl || !anonKey) return null;
  return createClient(supabaseUrl, anonKey);
}

export async function getEventBundle(slug: string): Promise<PublicEventBundle | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    if (allowDemoMode) return slug === demoBundle.event.public_slug ? demoBundle : demoBundle;
    return null;
  }

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("public_slug", slug)
    .single<EventRecord>();

  if (error || !event) return null;

  const [{ data: participants }, { data: representatives }, { data: results }] = await Promise.all([
    supabase
      .from("participants")
      .select("*")
      .eq("event_id", event.id)
      .order("entry_number", { ascending: true })
      .returns<ParticipantRecord[]>(),
    supabase.from("representatives").select("*").returns<RepresentativeRecord[]>(),
    supabase
      .from("draw_results")
      .select("*, participant:participants(*)")
      .eq("event_id", event.id)
      .order("rank", { ascending: true })
      .returns<DrawResultRecord[]>()
  ]);

  const eventParticipants = participants ?? [];
  return {
    event,
    participants: eventParticipants,
    representatives: representatives ?? [],
    results: results ?? [],
    stats: summarizeStats(eventParticipants)
  };
}

export async function audit(eventId: string, action: string, details: Record<string, unknown>, adminId?: string | null) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  await supabase.from("audit_logs").insert({
    event_id: eventId,
    admin_id: adminId ?? null,
    action,
    details
  });
}
