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
  title: "About",
  description:
    "GraineVault captures startup ideas and drafts AI research on the market, competitors, customers, trends, and risks.",
};

export default function AboutPage() {
  return (
    <LegalShell
      title="About GraineVault"
      description="A private vault for startup ideas, with AI research that helps you decide what is worth a closer look."
    >
      <LegalSection title="What it is">
        <p>
          GraineVault is for people who have more ideas than time to research
          them. You capture an idea, and the product drafts a brief on the
          market, competitors, customers, trends, and risks.
        </p>
        <p>
          The brief is a starting point. Readiness scores and market figures
          are estimates you can use to prioritize, then check yourself. The{" "}
          <Link href={routes.disclaimer}>Disclaimer</Link> explains what that
          output is for.
        </p>
      </LegalSection>

      <LegalSection title="How you capture an idea">
        <p>Every idea starts as a title and description. You can add:</p>
        <LegalList>
          <li>Text you type yourself</li>
          <li>A voice note, which is transcribed on the server</li>
          <li>
            A snapshot: a JPEG, PNG, or WebP photo, or a simple PDF, which is
            read into text on the server
          </li>
        </LegalList>
        <p>
          Ideas live in your vault. Archiving moves one out of the active list
          without deleting it. Archived ideas still count toward the free-plan
          limit. You can delete an idea, including its recording or file, from
          the idea page.
        </p>
      </LegalSection>

      <LegalSection title="How research works">
        <p>
          After the text is ready, GraineVault asks an AI model to draft the
          brief. Free research is a high-level snapshot. Pro research asks more
          specific questions, covers more areas, and investigates those
          questions before writing the working brief.
        </p>
        <p>
          Both free and Pro research can use web search. Links in a brief are
          there so you can open the source. They are part of the draft, and
          the page behind a link can change.
        </p>
      </LegalSection>

      <LegalSection title="Plans">
        <LegalList>
          <li>
            Free includes {FREE_IDEA_LIMIT} ideas. Archived ideas count toward
            that number.
          </li>
          <li>
            Pro is {formatUsd(PRO_MONTHLY_USD)} per month or{" "}
            {formatUsd(PRO_YEARLY_USD)} per year, billed through Stripe. Pro
            removes the idea cap and unlocks the deeper investigation.
          </li>
        </LegalList>
        <p>
          Plan details are on <Link href={routes.pricing}>Pricing</Link>. If
          you are on Pro, you can change or cancel from Settings.
        </p>
      </LegalSection>

      <LegalSection title="Your account">
        <p>
          Sign up with email or Google. Each account sees only its own ideas.
          Profile holds your email and the name you choose to show.
        </p>
        <p>
          How information is handled is in the{" "}
          <Link href={routes.privacy}>Privacy</Link> and{" "}
          <Link href={routes.dataProtection}>Data protection</Link> pages. Using
          the product is covered by the <Link href={routes.terms}>Terms</Link>.
        </p>
      </LegalSection>

      <LegalRelated current={routes.about} />
    </LegalShell>
  );
}
