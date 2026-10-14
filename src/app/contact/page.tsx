import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { LegalShell } from "@/components/legal/legal-shell";
import { LegalRelated } from "@/components/legal/legal-prose";
import { routes } from "@/lib/types";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact GraineVault by email at codegraines@gmail.com or with the contact form.",
};

export default function ContactPage() {
  return (
    <LegalShell
      title="Contact"
      description="Questions about your account, billing, or an idea in your vault."
      showUpdated={false}
    >
      <ContactForm />
      <LegalRelated current={routes.contact} />
    </LegalShell>
  );
}
