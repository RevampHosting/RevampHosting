"use client";

import Script from "next/script";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { getFormToken } from "@/app/actions/public";
import { cn } from "@/lib/utils";
import type { FormState } from "@/lib/validation";

/* --------------------------------------------------------------- Fields -- */

export function Field({
  label,
  name,
  error,
  required,
  hint,
  className,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: (props: { id: string; name: string; "aria-invalid"?: boolean; "aria-describedby"?: string; required?: boolean }) => ReactNode;
}) {
  const id = `${name}-${useId()}`;
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
        {required ? (
          <span className="ml-1 text-lime" aria-hidden>
            *
          </span>
        ) : (
          <span className="ml-2 normal-case tracking-normal text-white/40">(optional)</span>
        )}
      </label>
      {children({ id, name, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy, required })}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-white/45">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-sm text-red-400" role="alert">
          <AlertCircle className="size-4 shrink-0" aria-hidden /> {error}
        </p>
      )}
    </div>
  );
}

export function StatusMessage({ state }: { state: FormState }) {
  if (state.status !== "error" || !state.message) return null;
  return (
    <div role="alert" className="flex items-start gap-3 border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
      <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-400" aria-hidden />
      <p>{state.message}</p>
    </div>
  );
}

export function SuccessPanel({ title, message, action }: { title: string; message?: string; action?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="status"
      className="animate-fade-up border border-lime/40 bg-lime/[0.06] p-8 text-center outline-none sm:p-12"
    >
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-lime text-ink">
        <CheckCircle2 className="size-8" aria-hidden />
      </span>
      <h3 className="mt-6 font-display text-3xl font-bold uppercase">{title}</h3>
      {message && <p className="mx-auto mt-3 max-w-lg leading-relaxed text-white/80">{message}</p>}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

export function SubmitButton({ pending, children, className }: { pending: boolean; children: ReactNode; className?: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={cn(
        "group inline-flex w-full items-center justify-center gap-3 bg-lime px-8 py-5 font-display text-lg font-bold uppercase tracking-[0.16em] text-ink transition-all hover:bg-white hover:shadow-[0_0_0_5px_rgba(164,255,0,0.2)] disabled:cursor-wait disabled:opacity-70 sm:w-auto",
        className,
      )}
    >
      {pending && <Loader2 className="size-5 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

/* ------------------------------------------------------- Spam protection -- */

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: { sitekey: string; theme?: string }) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
  }
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * Hidden anti-spam fields: a honeypot input, a signed "form opened at" token,
 * and (when configured) a Cloudflare Turnstile challenge.
 * Pass a changing `resetKey` to refresh the Turnstile challenge after errors.
 */
export function SpamProtection({ resetKey }: { resetKey?: unknown }) {
  const [token, setToken] = useState("");
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getFormToken()
      .then((t) => !cancelled && setToken(t))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !scriptReady || !widgetRef.current || !window.turnstile) return;
    if (!widgetId.current) {
      widgetId.current = window.turnstile.render(widgetRef.current, { sitekey: TURNSTILE_SITE_KEY, theme: "dark" });
    }
  }, [scriptReady]);

  useEffect(() => {
    if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
  }, [resetKey]);

  return (
    <>
      <input type="hidden" name="formToken" value={token} />
      {/* Honeypot — hidden from people and assistive tech, irresistible to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Leave this field empty
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      {TURNSTILE_SITE_KEY && (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            strategy="afterInteractive"
            onReady={() => setScriptReady(true)}
          />
          <div ref={widgetRef} className="min-h-[65px]" />
        </>
      )}
    </>
  );
}
