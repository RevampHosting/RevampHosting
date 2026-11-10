"use client";

import { useActionState } from "react";
import { adminLogin } from "@/app/actions/admin";
import { StatusMessage, SubmitButton } from "@/components/forms/form-kit";
import { initialFormState } from "@/lib/validation";

export function LoginForm() {
  const [state, action, pending] = useActionState(adminLogin, initialFormState);
  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label htmlFor="admin-email" className="field-label">
          Email
        </label>
        <input id="admin-email" name="email" type="email" autoComplete="username" required defaultValue={state.values?.email} className="field" />
      </div>
      <div>
        <label htmlFor="admin-password" className="field-label">
          Password
        </label>
        <input id="admin-password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      <StatusMessage state={state} />
      <SubmitButton pending={pending} className="w-full sm:w-full">
        {pending ? "Signing in…" : "Sign in"}
      </SubmitButton>
    </form>
  );
}
