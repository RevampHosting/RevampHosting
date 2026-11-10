import { z } from "zod";
import { budgetOptions, contactMethodOptions, projectTypeOptions } from "@/config/services";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer`)
    .optional()
    .transform((v) => (v ? v : undefined));

const optionalChoice = (options: readonly string[], label: string) =>
  z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || options.includes(v), `Please choose a valid ${label}`);

const phone = z
  .string()
  .trim()
  .max(40)
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || /^[+()\-.\s\d]{7,40}$/.test(v), "Please enter a valid phone number");

export const quoteSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(120, "Name is too long"),
  email: z.string().trim().toLowerCase().pipe(z.email("Please enter a valid email address")).pipe(z.string().max(254)),
  phone,
  location: optionalText(200),
  projectType: optionalChoice(projectTypeOptions, "project type"),
  budget: optionalChoice(budgetOptions, "budget"),
  startDate: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))), "Please enter a valid date"),
  description: z
    .string()
    .trim()
    .min(10, "Please describe your project (at least 10 characters)")
    .max(5000, "Description must be 5,000 characters or fewer"),
  contactMethod: optionalChoice(contactMethodOptions, "contact method"),
});
export type QuoteInput = z.infer<typeof quoteSchema>;

export const reviewSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80, "Name is too long"),
  rating: z.coerce
    .number({ message: "Please select a star rating" })
    .int("Please select a star rating")
    .min(1, "Please select a star rating")
    .max(5, "Please select a star rating"),
  body: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters about your experience")
    .max(2000, "Reviews must be 2,000 characters or fewer"),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120, "Name is too long"),
  email: z.string().trim().toLowerCase().pipe(z.email("Please enter a valid email address")),
  phone,
  subject: optionalText(200),
  message: z
    .string()
    .trim()
    .min(10, "Please enter a message (at least 10 characters)")
    .max(5000, "Message must be 5,000 characters or fewer"),
});

/** Collects the first error message for each field. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Echo of submitted text values so fields stay filled after an error. */
  values?: Record<string, string>;
};

export const initialFormState: FormState = { status: "idle" };

export function textValues(formData: FormData, keys: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of keys) {
    const v = formData.get(k);
    if (typeof v === "string") out[k] = v.slice(0, 6000);
  }
  return out;
}

/* ------------------------------------------------------------ Uploads -- */

export const MAX_PHOTOS = 8;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

/** Detects real image types from file signatures (never trust the extension). */
export function detectImageType(bytes: Uint8Array): { mime: string; ext: string } | null {
  const b = bytes;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { mime: "image/png", ext: "png" };
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return { mime: "image/gif", ext: "gif" };
  const ascii = (start: number, end: number) => String.fromCharCode(...b.slice(start, end));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { mime: "image/webp", ext: "webp" };
  if (ascii(4, 8) === "ftyp") {
    const brand = ascii(8, 12);
    if (["heic", "heix", "hevc", "hevx", "heim", "heis"].includes(brand)) return { mime: "image/heic", ext: "heic" };
    if (["mif1", "msf1"].includes(brand)) return { mime: "image/heif", ext: "heif" };
  }
  return null;
}
