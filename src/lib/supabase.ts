import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

export const PHOTO_BUCKET = "quote-photos";

/**
 * Server-only Supabase client using the service-role key. It bypasses Row
 * Level Security, so it must never be imported into client components.
 * Returns null when Supabase has not been configured yet.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = env.supabaseUrl();
  const key = env.supabaseServiceRoleKey();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export class ServiceNotConfiguredError extends Error {
  constructor(service: string) {
    super(`${service} is not configured. Check your environment variables.`);
    this.name = "ServiceNotConfiguredError";
  }
}

export function requireSupabase(): SupabaseClient {
  const client = getSupabaseAdmin();
  if (!client) throw new ServiceNotConfiguredError("Supabase");
  return client;
}
