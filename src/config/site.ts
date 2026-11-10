/**
 * Default company information.
 *
 * These values are used until the owner saves their own details from
 * Admin → Website Settings (stored in the `site_settings` table). Anything
 * saved there overrides the value here, so this file is the safe fallback.
 */
export type BusinessHours = { days: string; hours: string };

export type SiteSettings = {
  companyName: string;
  shortName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string; // Full street address. Leave empty to hide the map.
  serviceArea: string;
  hours: BusinessHours[];
  socials: { facebook: string; instagram: string; linkedin: string; youtube: string };
  yearsInBusiness: string;
  projectsCompleted: string;
  licenseInfo: string;
  aboutIntro: string;
  aboutStory: string;
};

export const defaultSiteSettings: SiteSettings = {
  companyName: "Creations & Renovations",
  shortName: "Creations",
  tagline: "Built with precision. Built to last.",
  phone: "(555) 010-2480",
  email: "info@example.com",
  address: "",
  serviceArea: "Serving the greater metro area and surrounding communities",
  hours: [
    { days: "Monday – Friday", hours: "7:00 AM – 6:00 PM" },
    { days: "Saturday", hours: "8:00 AM – 2:00 PM" },
    { days: "Sunday", hours: "Closed" },
  ],
  socials: { facebook: "", instagram: "", linkedin: "", youtube: "" },
  yearsInBusiness: "15+",
  projectsCompleted: "500+",
  licenseInfo: "Licensed, bonded & fully insured",
  aboutIntro:
    "We are a full-service construction and carpentry company built on a simple idea: do the work right the first time. From structural framing to finish carpentry, our crews bring the same discipline, skill, and pride to every project — no matter the size.",
  aboutStory:
    "Founded by a working carpenter, our company has grown into a trusted team of builders, craftsmen, and project managers. We still run every job the way we did on day one: clear communication, honest pricing, clean job sites, and craftsmanship we are proud to put our name on.",
};

/** Public site URL — used for SEO metadata, sitemaps and links in emails. */
export function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    "http://localhost:3000";
  return url.replace(/\/$/, "");
}

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Our Work" },
  { href: "/about", label: "About Us" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
] as const;
