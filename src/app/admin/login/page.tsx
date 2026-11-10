import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="grid-texture grid min-h-screen place-items-center px-5 py-16">
      <div className="w-full max-w-md">
        <div className="border border-white/10 bg-charcoal p-8 shadow-2xl sm:p-10">
          <p className="eyebrow">Restricted area</p>
          <h1 className="mt-4 font-display text-4xl font-extrabold uppercase">Admin sign in</h1>
          <p className="mt-2 text-sm text-muted">Sign in to manage quote requests, reviews and website information.</p>
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-white/60 hover:text-lime">
            ← Back to website
          </Link>
        </p>
      </div>
    </main>
  );
}
