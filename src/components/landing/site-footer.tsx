import Link from "next/link";
import { legalLinks } from "@/lib/legal";

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-slate-700/60 px-6 py-8 md:px-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} GraineVault
        </p>
        <nav aria-label="Company and policies" className="flex flex-wrap gap-x-5 gap-y-2">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-slate-400 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
