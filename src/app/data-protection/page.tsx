import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/legal/legal-shell";
import { LegalList, LegalRelated, LegalSection } from "@/components/legal/legal-prose";
import { CONTACT_EMAIL } from "@/lib/legal";
import { routes } from "@/lib/types";

export const metadata: Metadata = {
  title: "Data protection",
  description:
    "How GraineVault protects account data and ideas, and the controls you have to update or delete them.",
};

export default function DataProtectionPage() {
  return (
    <LegalShell
      title="Data protection"
      description="How idea and account data is protected, and what you can do with it inside the product."
    >
      <LegalSection title="How this fits with Privacy">
        <p>
          The <Link href={routes.privacy}>Privacy</Link> page lists what is
          collected and why. This page describes the safeguards around that
          data and the controls available to you.
        </p>
      </LegalSection>

      <LegalSection title="Access to your vault">
        <LegalList>
          <li>The vault, archive, profile, and settings require a signed-in account.</li>
          <li>
            Ideas are stored per account. Database rules restrict each account
            to its own rows, so one signed-in user cannot read another
            user&apos;s ideas through the app.
          </li>
          <li>
            Voice notes, photos, and PDFs are stored in a private file bucket.
            They are not published on a public URL.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="How processing is set up">
        <LegalList>
          <li>The site is served over HTTPS.</li>
          <li>
            Transcription, text extraction, and research run on the server.
            The AI provider keys are not shipped to the browser.
          </li>
          <li>
            Subscription checkout and the billing portal run on Stripe. Card
            details are collected there.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Services that process data for the product">
        <p>
          Supabase hosts accounts, the database, and private files. Stripe
          hosts payments. OpenAI drafts research and can run web search. Each
          one processes data in order to
          provide that part of the service.
        </p>
        <p>
          Their processing locations can include countries other than yours.
          Details of what is sent are on the Privacy page.
        </p>
      </LegalSection>

      <LegalSection title="Controls in the product">
        <LegalList>
          <li>
            <strong>Name.</strong> Update your first and last name on Profile.
          </li>
          <li>
            <strong>A single idea.</strong> Delete it from the idea page. That
            deletes the idea record and its stored recording or file.
          </li>
          <li>
            <strong>Archive.</strong> Archiving hides an idea from the active
            vault and keeps the record. It does not delete it, and it still
            counts toward the free-plan limit.
          </li>
          <li>
            <strong>Subscription.</strong> Open the Stripe billing portal from
            Settings to change or cancel Pro.
          </li>
          <li>
            <strong>Session.</strong> Sign out from the account menu on this
            device.
          </li>
          <li>
            <strong>Account.</strong> Delete it from Profile. That removes the
            login, ideas, and stored files, and cancels Pro if you have it.
          </li>
        </LegalList>
        <p>
          You can also email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or use the{" "}
          <Link href={routes.contact}>contact form</Link>.
        </p>
      </LegalSection>

      <LegalSection title="What to keep out of an idea">
        <p>
          Idea text and files are processed by the AI provider and stored in
          your vault. Use them for the idea itself. Do not put passwords,
          access keys, payment cards, government ID numbers, health details, or
          someone else&apos;s private information into a capture.
        </p>
      </LegalSection>

      <LegalSection title="Limits">
        <p>
          These measures reduce the chance of unwanted access. They do not
          make storage or transmission immune to failure, misuse of a stolen
          login, or a problem at a provider. Protect the email and password
          on the account the same way you protect other logins.
        </p>
      </LegalSection>

      <LegalRelated current={routes.dataProtection} />
    </LegalShell>
  );
}
