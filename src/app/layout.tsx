import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { getSiteUrl } from "@/config/site";
import { getSiteSettings } from "@/lib/data/settings";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const description = `${s.companyName} — general construction, remodeling, custom carpentry, framing, decks and flooring. ${s.licenseInfo}. Request a free quote today.`;
  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: `${s.companyName} | Construction & Carpentry`, template: `%s | ${s.companyName}` },
    description,
    openGraph: { type: "website", siteName: s.companyName, title: s.companyName, description },
    twitter: { card: "summary_large_image", title: s.companyName, description },
    alternates: { canonical: "/" },
  };
}

export const viewport: Viewport = { themeColor: "#080808", colorScheme: "dark" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${barlow.variable}`} suppressHydrationWarning>
      <head>
        {/* Enables scroll-reveal animations only when JavaScript runs, so content is never hidden without it. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-screen bg-ink text-white">{children}</body>
    </html>
  );
}
