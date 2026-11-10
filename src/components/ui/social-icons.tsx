import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = { viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true } as const;

export const FacebookIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z" />
  </svg>
);
export const InstagramIcon = (p: P) => (
  <svg {...base} {...p} fill="none" stroke="currentColor" strokeWidth={1.8}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
  </svg>
);
export const LinkedinIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6.9 8.6H3.8V20h3.1V8.6zM5.3 3.5a1.8 1.8 0 100 3.6 1.8 1.8 0 000-3.6zM20.2 13.6c0-3-1.6-5.2-4.4-5.2-1.5 0-2.5.8-2.9 1.6V8.6H10V20h3.1v-5.8c0-1.5.4-2.9 2.2-2.9 1.8 0 1.8 1.7 1.8 3V20h3.1v-6.4z" />
  </svg>
);
export const YoutubeIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M21.6 7.2a2.5 2.5 0 00-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 002.4 7.2 26 26 0 002 12a26 26 0 00.4 4.8 2.5 2.5 0 001.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 001.8-1.8A26 26 0 0022 12a26 26 0 00-.4-4.8zM10 15V9l5.2 3L10 15z" />
  </svg>
);
