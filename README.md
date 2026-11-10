# Construction & Carpentry Company Website

A production-ready website for a construction and carpentry company, built with **Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Supabase and Resend**.

## Features

| Area | What it does |
| --- | --- |
| **Public site** | Home, Services, Our Work (filterable gallery + lightbox), About, Reviews, Contact, Request a Quote. Responsive, accessible, SEO metadata, sitemap and robots.txt. |
| **Quote requests** | Validated form with up to 8 photo uploads (resized in the browser, type-checked from file contents on the server). Saved to Supabase, photos stored in a **private** bucket, and a formatted email (with secure 7-day photo links) is sent to `QUOTE_NOTIFICATION_EMAIL` via Resend. Success and error messages are shown to the customer. |
| **Reviews** | Customers submit 1–5 stars, name and text. New reviews are always **pending** until an admin approves them. The average and the total are calculated on the server from approved reviews only. |
| **Contact form** | Saved to the database and emailed to the company. |
| **Spam protection** | Server-side validation, a hidden honeypot field, a signed form-timing token that rejects bot-speed submissions, per-IP rate limits stored in the database (IPs are stored only as hashes), a link filter, and optional Cloudflare Turnstile. |
| **Admin dashboard** (`/admin`) | Supabase Auth login restricted to `ADMIN_EMAILS`, a signed HTTP-only session cookie, and login rate limiting. View quotes (contact info, description, photos), change status (New / Contacted / In Progress / Completed), add notes and delete requests. Approve, reject or delete reviews. Read and manage messages. Edit company information (name, phone, email, address and map, hours, social links, About text). |

## Setup

### 1. Supabase
1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the contents of `supabase/migrations/0001_init.sql` and run it. This creates the tables (with Row Level Security locked down) and the private `quote-photos` storage bucket.
3. **Authentication → Users → Add user**: create the owner's login (email + password).
4. Copy the Project URL and the **service_role** key from Project Settings → API.

### 2. Resend
1. Create an API key at [resend.com](https://resend.com).
2. Verify your domain and set `EMAIL_FROM` to an address on it. Until the domain is verified, `onboarding@resend.dev` can only send to your own Resend account email.

### 3. Environment variables
Copy `.env.example` to `.env.local` and fill it in, or add the same variables in your host's dashboard (e.g. Vercel → Settings → Environment Variables). All secrets stay on the server.

### 4. Run
```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start   # production
```
Deploys to Vercel (or any Node host) with no extra configuration.

> The site renders with placeholder defaults even before Supabase and Resend are configured. Forms then show a clear "can't send right now" message, and the admin area explains what is missing.

## Customising content

| What | Where |
| --- | --- |
| Company name, phone, email, address, hours, socials, About text | **Admin → Website Settings** (defaults in `src/config/site.ts`) |
| Services (add / remove / reorder; also feeds the quote dropdown) | `src/config/services.ts` |
| Portfolio projects and categories | `src/config/projects.ts` |
| Photos | `src/config/images.ts`: replace the Unsplash placeholders with your own photos (put files in `public/images/` and use `"/images/your-photo.jpg"`) |
| Budget ranges, contact methods | `src/config/services.ts` |
| Colours and fonts | `src/app/globals.css` (`@theme`) and `src/app/layout.tsx` |

Social icons appear only for profiles you fill in. The Google Map appears on the Contact page once an address is saved.

## Project structure
```
src/
  app/(site)/        public pages
  app/admin/         login + dashboard (every page and action re-checks the session)
  app/actions/       server actions (quote, reviews, contact, admin)
  components/        UI, layout, sections, forms, admin
  config/            editable content (site, services, projects, images)
  lib/               env, Supabase, auth, email, security, validation, data access
supabase/migrations/ database schema
```

## Security notes
- The Supabase **service-role key is only used on the server**. All tables have RLS enabled with no public policies, so the browser can never read or write data directly.
- Uploaded photos live in a private bucket and are only shared through expiring signed URLs.
- Admin sessions are signed JWT cookies (HTTP-only, SameSite=Lax, Secure in production, 8-hour expiry). Every admin page and server action verifies the session and the `ADMIN_EMAILS` allowlist.
- Optional housekeeping: periodically clear old rows from `rate_limits` (see the comment at the end of the migration).
