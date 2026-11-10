import "server-only";

/**
 * Centralised access to server-side environment variables.
 * Nothing in this file is ever sent to the browser.
 */
const read = (name: string) => {
  const value = process.env[name];
  return value && value.trim() !== "" ? value.trim() : undefined;
};

export const env = {
  supabaseUrl: () => read("SUPABASE_URL"),
  supabaseServiceRoleKey: () => read("SUPABASE_SERVICE_ROLE_KEY"),
  resendApiKey: () => read("RESEND_API_KEY"),
  emailFrom: () => read("EMAIL_FROM") ?? "Website <onboarding@resend.dev>",
  quoteNotificationEmail: () => read("QUOTE_NOTIFICATION_EMAIL"),
  contactNotificationEmail: () => read("CONTACT_NOTIFICATION_EMAIL") ?? read("QUOTE_NOTIFICATION_EMAIL"),
  reviewNotificationEmail: () => read("REVIEW_NOTIFICATION_EMAIL") ?? read("QUOTE_NOTIFICATION_EMAIL"),
  adminEmails: () =>
    (read("ADMIN_EMAILS") ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  sessionSecret: () => read("SESSION_SECRET"),
  turnstileSecretKey: () => read("TURNSTILE_SECRET_KEY"),
};

export const isSupabaseConfigured = () => Boolean(env.supabaseUrl() && env.supabaseServiceRoleKey());
export const isEmailConfigured = () => Boolean(env.resendApiKey());
