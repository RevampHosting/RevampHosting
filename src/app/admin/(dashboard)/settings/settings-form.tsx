"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { saveSettings } from "@/app/actions/admin";
import { StatusMessage, SubmitButton } from "@/components/forms/form-kit";
import type { SiteSettings } from "@/config/site";
import { initialFormState } from "@/lib/validation";

type FieldDef = { name: string; label: string; type?: "text" | "email" | "tel" | "url" | "textarea"; hint?: string; rows?: number; wide?: boolean };

const sections: { title: string; fields: FieldDef[] }[] = [
  {
    title: "Company",
    fields: [
      { name: "companyName", label: "Company name" },
      { name: "shortName", label: "Short name (logo)", hint: "Shown large in the logo, e.g. the first word of your company name." },
      { name: "tagline", label: "Tagline", wide: true },
      { name: "licenseInfo", label: "License / insurance line", wide: true },
      { name: "yearsInBusiness", label: "Years in business", hint: 'e.g. "15+"' },
      { name: "projectsCompleted", label: "Projects completed", hint: 'e.g. "500+"' },
    ],
  },
  {
    title: "Contact",
    fields: [
      { name: "phone", label: "Business phone", type: "tel" },
      { name: "email", label: "Business email (shown publicly)", type: "email" },
      { name: "address", label: "Business address", wide: true, hint: "Leave blank to hide the address and Google Map." },
      { name: "serviceArea", label: "Service area", wide: true },
      { name: "hours", label: "Business hours", type: "textarea", rows: 4, wide: true, hint: 'One per line, formatted as "Days | Hours", e.g. "Monday – Friday | 7:00 AM – 6:00 PM".' },
    ],
  },
  {
    title: "Social media",
    fields: [
      { name: "facebook", label: "Facebook URL", type: "url" },
      { name: "instagram", label: "Instagram URL", type: "url" },
      { name: "linkedin", label: "LinkedIn URL", type: "url" },
      { name: "youtube", label: "YouTube URL", type: "url" },
    ],
  },
  {
    title: "About us",
    fields: [
      { name: "aboutIntro", label: "Introduction", type: "textarea", rows: 4, wide: true },
      { name: "aboutStory", label: "Our story", type: "textarea", rows: 5, wide: true },
    ],
  },
];

function initialValues(s: SiteSettings): Record<string, string> {
  return {
    ...Object.fromEntries(Object.entries(s).filter(([, v]) => typeof v === "string")),
    ...s.socials,
    hours: s.hours.map((h) => `${h.days} | ${h.hours}`).join("\n"),
  } as Record<string, string>;
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action, pending] = useActionState(saveSettings, initialFormState);
  const values = state.values ?? initialValues(settings);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} className="max-w-4xl space-y-8">
      {sections.map((section) => (
        <fieldset key={section.title} className="border border-white/10 bg-charcoal p-6">
          <legend className="px-2 font-display text-lg font-bold uppercase tracking-wide">{section.title}</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            {section.fields.map((f) => {
              const id = `setting-${f.name}`;
              const common = {
                id,
                name: f.name,
                defaultValue: values[f.name] ?? "",
                className: "field",
                "aria-invalid": errors[f.name] ? true : undefined,
                "aria-describedby": f.hint || errors[f.name] ? `${id}-desc` : undefined,
              };
              return (
                <div key={f.name} className={f.wide || f.type === "textarea" ? "sm:col-span-2" : undefined}>
                  <label htmlFor={id} className="field-label">{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea {...common} rows={f.rows ?? 4} className="field resize-y" />
                  ) : (
                    <input {...common} type={f.type ?? "text"} placeholder={f.type === "url" ? "https://" : undefined} />
                  )}
                  {(errors[f.name] || f.hint) && (
                    <p id={`${id}-desc`} className={errors[f.name] ? "mt-1.5 text-sm text-red-400" : "mt-1.5 text-xs text-white/45"}>
                      {errors[f.name] ?? f.hint}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}

      <StatusMessage state={state} />
      {state.status === "success" && (
        <p role="status" className="flex items-center gap-2 border border-lime/40 bg-lime/10 p-4 text-sm text-lime">
          <CheckCircle2 className="size-5" aria-hidden /> {state.message}
        </p>
      )}
      <SubmitButton pending={pending}>{pending ? "Saving…" : "Save settings"}</SubmitButton>
      <p className="text-xs text-white/45">
        Services, projects and photos are edited in <code>src/config/</code> — see the README for details.
      </p>
    </form>
  );
}
