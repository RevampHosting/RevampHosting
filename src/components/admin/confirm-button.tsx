"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Submit button for admin forms; optionally asks for confirmation first. */
export function AdminSubmit({
  children,
  confirmMessage,
  variant = "primary",
  className,
  name,
  value,
}: {
  children: ReactNode;
  confirmMessage?: string;
  variant?: "primary" | "danger" | "ghost";
  className?: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      onClick={(e) => {
        if (confirmMessage && !window.confirm(confirmMessage)) e.preventDefault();
      }}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition-colors disabled:opacity-60",
        variant === "primary" && "bg-lime text-ink hover:bg-white",
        variant === "danger" && "border border-red-500/40 text-red-300 hover:bg-red-500 hover:text-white",
        variant === "ghost" && "border border-white/15 text-white/80 hover:border-lime hover:text-lime",
        className,
      )}
    >
      {pending && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
