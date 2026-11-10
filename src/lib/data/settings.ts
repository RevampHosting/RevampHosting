import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { defaultSiteSettings, type SiteSettings } from "@/config/site";
import { getSupabaseAdmin } from "../supabase";

export const SETTINGS_TAG = "site-settings";

/** Merges saved settings over defaults, ignoring blank/invalid values. */
export function mergeSettings(saved: unknown): SiteSettings {
  const s = (saved && typeof saved === "object" ? saved : {}) as Partial<SiteSettings>;
  const str = (v: unknown, fallback: string) => (typeof v === "string" && v.trim() !== "" ? v : fallback);
  const optional = (v: unknown, fallback: string) => (typeof v === "string" ? v : fallback);
  const hours =
    Array.isArray(s.hours) && s.hours.length
      ? s.hours
          .filter((h) => h && typeof h.days === "string" && typeof h.hours === "string" && h.days.trim())
          .map((h) => ({ days: h.days, hours: h.hours }))
      : defaultSiteSettings.hours;
  const socials = (s.socials ?? {}) as Partial<SiteSettings["socials"]>;
  return {
    companyName: str(s.companyName, defaultSiteSettings.companyName),
    shortName: str(s.shortName, defaultSiteSettings.shortName),
    tagline: str(s.tagline, defaultSiteSettings.tagline),
    phone: str(s.phone, defaultSiteSettings.phone),
    email: str(s.email, defaultSiteSettings.email),
    address: optional(s.address, defaultSiteSettings.address),
    serviceArea: str(s.serviceArea, defaultSiteSettings.serviceArea),
    hours: hours.length ? hours : defaultSiteSettings.hours,
    socials: {
      facebook: optional(socials.facebook, defaultSiteSettings.socials.facebook),
      instagram: optional(socials.instagram, defaultSiteSettings.socials.instagram),
      linkedin: optional(socials.linkedin, defaultSiteSettings.socials.linkedin),
      youtube: optional(socials.youtube, defaultSiteSettings.socials.youtube),
    },
    yearsInBusiness: str(s.yearsInBusiness, defaultSiteSettings.yearsInBusiness),
    projectsCompleted: str(s.projectsCompleted, defaultSiteSettings.projectsCompleted),
    licenseInfo: str(s.licenseInfo, defaultSiteSettings.licenseInfo),
    aboutIntro: str(s.aboutIntro, defaultSiteSettings.aboutIntro),
    aboutStory: str(s.aboutStory, defaultSiteSettings.aboutStory),
  };
}

/** Uncached read — used by the admin settings editor. */
export async function readSiteSettings(): Promise<SiteSettings> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return defaultSiteSettings;
  const { data, error } = await supabase.from("site_settings").select("data").eq("id", 1).maybeSingle();
  if (error) {
    console.error("[settings] load failed:", error.message);
    return defaultSiteSettings;
  }
  return mergeSettings(data?.data);
}

/** Cached read for public pages. Invalidated when the admin saves settings. */
export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag(SETTINGS_TAG);
  cacheLife("hours");
  return readSiteSettings();
}
