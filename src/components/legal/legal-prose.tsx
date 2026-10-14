import Link from "next/link";
import { legalLinks } from "@/lib/legal";

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-300 [&_a]:text-indigo-300 [&_a]:underline-offset-4 hover:[&_a]:text-white hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-slate-100">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-slate-500">{children}</ul>
  );
}

export function LegalRelated({ current }: { current: string }) {
  const others = legalLinks.filter((link) => link.href !== current);

  return (
    <nav aria-label="Related pages" className="mt-10 border-t border-slate-700/60 pt-6">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Related
      </p>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {others.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-indigo-300 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
