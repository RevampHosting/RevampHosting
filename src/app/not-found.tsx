import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid-texture grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="font-display text-[8rem] font-extrabold leading-none text-lime sm:text-[12rem]">404</p>
        <h1 className="heading-xl mt-2 text-4xl sm:text-5xl">Page not found</h1>
        <p className="mx-auto mt-4 max-w-md text-muted">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/" className="bg-lime px-7 py-4 font-display font-bold uppercase tracking-[0.14em] text-ink hover:bg-white">
            Back to home
          </Link>
          <Link href="/contact" className="border border-white/30 px-7 py-4 font-display font-bold uppercase tracking-[0.14em] hover:border-lime hover:text-lime">
            Contact us
          </Link>
        </div>
      </div>
    </main>
  );
}
