import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/legal/legal-shell";
import { LegalList, LegalRelated, LegalSection } from "@/components/legal/legal-prose";
import {
  FREE_IDEA_LIMIT,
  PRO_MONTHLY_USD,
  PRO_YEARLY_USD,
  formatUsd,
} from "@/lib/billing";
import { routes } from "@/lib/types";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "The terms for using GraineVault: accounts, your ideas, acceptable use, plans, and AI research output.",
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms"
      description="The rules for using GraineVault. Creating an account or continuing to use the product means you agree to these terms."
    >
      <LegalSection title="The service">
        <p>
          GraineVault lets you capture startup ideas and read AI-generated
          research on them. These terms cover the website, accounts, vault,
          and paid plans. They sit alongside the{" "}
          <Link href={routes.privacy}>Privacy</Link> page and the{" "}
          <Link href={routes.disclaimer}>Disclaimer</Link>.
        </p>
      </LegalSection>

      <LegalSection title="Accounts">
        <p>
          You need an account to use the vault. Use an email address you can
          access, or Google sign-in. You are responsible for activity under
          your login and for keeping that login to yourself.
        </p>
        <p>
          You should only create an account if you are old enough to agree to
          a contract where you live.
        </p>
      </LegalSection>

      <LegalSection title="Your ideas">
        <p>
          You keep ownership of the ideas, text, and files you submit.
          GraineVault needs permission to host them, transcribe or extract
          them, and send the resulting text to the AI provider that drafts
          research. That permission is limited to operating the product for
          your account.
        </p>
        <p>
          You confirm you have the right to submit what you upload. When you
          delete an idea, the product deletes that idea and its stored
          recording or file. A request already in progress may finish, and
          short-lived operational copies can remain until they age out of the
          provider systems described in the Privacy page.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>Use the product for your own idea research. Do not:</p>
        <LegalList>
          <li>Break the law, or help someone else break it</li>
          <li>Upload material you do not have the rights to store or process</li>
          <li>Try to open another person&apos;s vault or account</li>
          <li>Probe, disrupt, overload, or reverse engineer the service in order to abuse it</li>
          <li>
            Submit passwords, access keys, payment card data, or sensitive
            information about other people
          </li>
        </LegalList>
        <p>
          GraineVault may suspend an account that is used this way, and may
          remove the content involved.
        </p>
      </LegalSection>

      <LegalSection title="Plans and billing">
        <LegalList>
          <li>
            Free includes {FREE_IDEA_LIMIT} ideas. Archived ideas count toward
            that limit.
          </li>
          <li>
            Pro is {formatUsd(PRO_MONTHLY_USD)} per month or{" "}
            {formatUsd(PRO_YEARLY_USD)} per year, charged by Stripe. Taxes may
            be added at checkout where Stripe collects them.
          </li>
        </LegalList>
        <p>
          You can change or cancel Pro from Settings. That opens Stripe&apos;s
          billing portal, and the timing shown there is the timing that
          applies. If a payment fails, Pro access can end and the account
          returns to the free limit.
        </p>
      </LegalSection>

      <LegalSection title="Research output">
        <p>
          Briefs, scores, market figures, competitor notes, and source links
          are generated automatically. They can be incomplete or wrong. You
          decide what to do with them, and you are responsible for checking
          anything you rely on. Read the{" "}
          <Link href={routes.disclaimer}>Disclaimer</Link> before you treat a
          brief as a basis for spending money or starting a company.
        </p>
        <p>
          You may use the research generated for your account for your own
          work. GraineVault does not take ownership of your ideas by generating
          that research.
        </p>
      </LegalSection>

      <LegalSection title="The product can change">
        <p>
          Features can be added, limited, or removed. Some screens, including
          Weekly Digest and Board, are placeholders and may not do what their
          labels suggest yet. The service can be unavailable during outages or
          maintenance.
        </p>
      </LegalSection>

      <LegalSection title="The product itself">
        <p>
          The GraineVault name, logo, and software stay with the operator of
          the service. These terms do not transfer that to you. You receive a
          right to use the product under these terms while your account is in
          good standing.
        </p>
      </LegalSection>

      <LegalSection title="Liability">
        <p>
          The product is provided as it is available. To the extent the law
          allows, GraineVault is not liable for decisions you make from
          research output, for lost profits, or for indirect or consequential
          damages arising from use of the service.
        </p>
        <p>
          Some places do not allow certain limits. In those places, the limits
          apply only as far as the law allows. Consumer protections that cannot
          be waived still apply.
        </p>
      </LegalSection>

      <LegalSection title="Changes to these terms">
        <p>
          Updated terms are posted on this page, and the date at the top
          changes. If you keep using GraineVault after that update, you are
          agreeing to the new terms. If you do not agree, stop using the
          product and delete the ideas you do not want stored.
        </p>
      </LegalSection>

      <LegalRelated current={routes.terms} />
    </LegalShell>
  );
}
