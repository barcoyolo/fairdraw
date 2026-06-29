import { createClient } from "@supabase/supabase-js";

const required = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missing = required.filter((name) => !process.env[name]);

if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { data, error } = await supabase
  .from("events")
  .select("id,title,public_slug")
  .eq("public_slug", "world-cup-community-draw")
  .maybeSingle();

if (error) {
  console.error(`Supabase live check failed: ${error.message}`);
  process.exit(1);
}

if (!data) {
  console.error("Supabase is reachable, but the seed event is missing. Run supabase/seed.sql.");
  process.exit(1);
}

console.log(`Supabase live check passed: ${data.title} (${data.public_slug})`);
