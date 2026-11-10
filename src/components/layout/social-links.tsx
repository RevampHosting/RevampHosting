import type { SiteSettings } from "@/config/site";
import { cn } from "@/lib/utils";
import { FacebookIcon, InstagramIcon, LinkedinIcon, YoutubeIcon } from "../ui/social-icons";

const platforms = [
  { key: "facebook", label: "Facebook", Icon: FacebookIcon },
  { key: "instagram", label: "Instagram", Icon: InstagramIcon },
  { key: "linkedin", label: "LinkedIn", Icon: LinkedinIcon },
  { key: "youtube", label: "YouTube", Icon: YoutubeIcon },
] as const;

/** Renders only the social profiles that have been filled in. */
export function SocialLinks({ socials, className }: { socials: SiteSettings["socials"]; className?: string }) {
  const active = platforms.filter((p) => socials[p.key]);
  if (!active.length) return null;
  return (
    <ul className={cn("flex gap-2", className)}>
      {active.map(({ key, label, Icon }) => (
        <li key={key}>
          <a
            href={socials[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Follow us on ${label}`}
            className="grid size-10 place-items-center border border-white/15 text-white/80 transition-all hover:border-lime hover:bg-lime hover:text-ink"
          >
            <Icon className="size-[18px]" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export const hasSocials = (socials: SiteSettings["socials"]) => Object.values(socials).some(Boolean);
