"use client";

import { useActionState, startTransition, type FormEvent } from "react";
import { Send } from "lucide-react";
import { submitContact } from "@/app/actions/public";
import { initialFormState } from "@/lib/validation";
import { Field, SpamProtection, StatusMessage, SubmitButton, SuccessPanel } from "./form-kit";

export function ContactForm() {
  const [state, dispatch, pending] = useActionState(submitContact, initialFormState);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => dispatch(fd));
  }

  if (state.status === "success") return <SuccessPanel title="Message sent" message={state.message} />;
  const err = state.fieldErrors ?? {};

  return (
    <form onSubmit={onSubmit} className="relative grid gap-6 sm:grid-cols-2">
      <Field label="Name" name="name" required error={err.name}>
        {(p) => <input {...p} type="text" autoComplete="name" maxLength={120} className="field" />}
      </Field>
      <Field label="Email" name="email" required error={err.email}>
        {(p) => <input {...p} type="email" autoComplete="email" maxLength={254} className="field" />}
      </Field>
      <Field label="Phone" name="phone" error={err.phone}>
        {(p) => <input {...p} type="tel" autoComplete="tel" maxLength={40} className="field" />}
      </Field>
      <Field label="Subject" name="subject" error={err.subject}>
        {(p) => <input {...p} type="text" maxLength={200} className="field" />}
      </Field>
      <Field label="Message" name="message" required error={err.message} className="sm:col-span-2">
        {(p) => <textarea {...p} rows={6} minLength={10} maxLength={5000} className="field resize-y" />}
      </Field>
      <div className="space-y-4 sm:col-span-2">
        <SpamProtection resetKey={state} />
        <StatusMessage state={state} />
        <SubmitButton pending={pending}>
          {pending ? "Sending…" : "Send Message"}
          {!pending && <Send className="size-5" aria-hidden />}
        </SubmitButton>
      </div>
    </form>
  );
}
