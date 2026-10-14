import { routes } from "@/lib/types";

export const LEGAL_UPDATED = "October 14, 2026";

export const CONTACT_EMAIL = "codegraines@gmail.com";

export const legalLinks = [
  { href: routes.about, label: "About" },
  { href: routes.contact, label: "Contact" },
  { href: routes.privacy, label: "Privacy" },
  { href: routes.terms, label: "Terms" },
  { href: routes.dataProtection, label: "Data protection" },
  { href: routes.disclaimer, label: "Disclaimer" },
] as const;
