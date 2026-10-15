import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/legal/legal-shell";
import { LegalList, LegalRelated, LegalSection } from "@/components/legal/legal-prose";
import { CONTACT_EMAIL } from "@/lib/legal";
import { routes } from "@/lib/types";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What GraineVault collects, why it is used, and which services process your account, ideas, and payments.",
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy"
      description="What GraineVault collects when you use the site, why it is used, and who else processes it."
    >
      <LegalSection title="Who this covers">
        <p>
          This page describes the GraineVault product: the website, accounts,
          vault, and research briefs. Safeguards and the controls you already
          have in the product are on the{" "}
          <Link href={routes.dataProtection}>Data protection</Link> page.
        </p>
      </LegalSection>

      <LegalSection title="Information you provide">
        <LegalList>
          <li>
            <strong>Account.</strong> Email address, a password handled by the
            authentication provider, and your first and last name if you enter
            them. If you sign in with Google, we receive the identity details
            Google shares for that sign-in.
          </li>
          <li>
            <strong>Ideas.</strong> Titles, descriptions, voice recordings,
            photos, and PDFs you upload, plus the text extracted from those
            files and the research generated from them.
          </li>
          <li>
            <strong>Contact messages.</strong> The name, email, and message you
            send from the contact form. These are stored so we can reply. Other
            accounts cannot read them.
          </li>
          <li>
            <strong>Billing.</strong> If you subscribe, Stripe processes the
            payment. GraineVault stores your plan, billing interval, and the
            Stripe customer and subscription identifiers needed to recognize
            Pro. Card numbers are entered on Stripe and are not stored in the
            vault.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Information collected as you use the product">
        <LegalList>
          <li>
            Session cookies that keep you signed in, set by the authentication
            provider.
          </li>
          <li>
            A short-lived cookie, about ten minutes, used only to return you
            to the page you were opening after sign-in.
          </li>
          <li>
            A preference on your device for whether the sidebar is collapsed.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Why it is used">
        <LegalList>
          <li>Create and secure your account</li>
          <li>Store your ideas and files, and show them only to you</li>
          <li>
            Transcribe voice, extract text from snapshots, and draft research
          </li>
          <li>Apply the free-plan idea limit and run Pro billing</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="AI processing">
        <p>
          Idea text, transcripts, and text extracted from files are sent to
          OpenAI so the brief can be written. Free and Pro research can use
          web search. Pro investigation searches
          more broadly before the brief is written.
        </p>
        <p>
          Put into an idea only what you are comfortable sending to that
          provider. Leave out passwords, access keys, and other people&apos;s
          private information.
        </p>
      </LegalSection>

      <LegalSection title="Who else processes it">
        <p>
          These services process data to run GraineVault. Idea content and
          account data are not sold.
        </p>
        <LegalList>
          <li>
            <strong>Supabase</strong> — accounts, the database, and private
            file storage for recordings and snapshots
          </li>
          <li>
            <strong>Stripe</strong> — checkout, subscriptions, and the billing
            portal
          </li>
          <li>
            <strong>OpenAI</strong> — transcription, text extraction,
            and research, including web search where that step runs
          </li>
        </LegalList>
        <p>
          Those providers may process data in the countries where they
          operate, which can differ from where you live.
        </p>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          Cookies are used to keep your session and to remember a sign-in
          return path. GraineVault does not set advertising cookies.
        </p>
      </LegalSection>

      <LegalSection title="How long it is kept">
        <p>
          Ideas and their files stay until you delete them. Contact messages
          stay until we no longer need them to handle your request. Deleting an idea
          removes that idea and its stored recording or file. Billing
          identifiers stay for as long as they are needed to run the
          subscription and meet payment-record obligations. Session cookies
          follow the authentication session. The sign-in return cookie expires
          after about ten minutes.
        </p>
      </LegalSection>

      <LegalSection title="What you can do">
        <LegalList>
          <li>Edit your name on Profile</li>
          <li>Delete an idea, including its file, from the idea page</li>
          <li>Cancel Pro from Settings, which opens the Stripe billing portal</li>
          <li>Sign out from the account menu</li>
          <li>
            Delete the whole account from Profile. That removes the login,
            ideas, and files, and cancels Pro if you have it
          </li>
        </LegalList>
        <p>
          You can also email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or use the{" "}
          <Link href={routes.contact}>contact form</Link>.
        </p>
        <p>
          If the privacy law where you live gives you rights to access,
          correct, delete, or object to certain uses, those rights still apply.
          The controls above are how most of them are exercised in the product
          today.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          GraineVault is a tool for working through startup ideas. It is not
          directed at children, and accounts should be created by someone old
          enough to agree to the <Link href={routes.terms}>Terms</Link>.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          When these practices change, this page is updated and the date at
          the top changes with it.
        </p>
      </LegalSection>

      <LegalRelated current={routes.privacy} />
    </LegalShell>
  );
}
