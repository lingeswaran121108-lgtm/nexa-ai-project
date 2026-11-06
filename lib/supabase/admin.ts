import { createClient } from "@supabase/supabase-js";

/**
 * Privileged Supabase Admin Client using SUPABASE_SERVICE_ROLE_KEY.
 * WARNING: Never import this client into client-side code / browser bundles.
 */
export function getAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.warn("[AdminSupabase] SUPABASE_SERVICE_ROLE_KEY is missing. Admin operations will be restricted.");
  }

  return createClient(supabaseUrl, serviceRoleKey || "missing-service-key", {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
