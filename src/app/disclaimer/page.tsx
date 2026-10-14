import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/legal/legal-shell";
import { LegalList, LegalRelated, LegalSection } from "@/components/legal/legal-prose";
import { routes } from "@/lib/types";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "GraineVault research is an aid for exploring ideas. It is not professional advice or a forecast of success.",
};

export default function DisclaimerPage() {
  return (
    <LegalShell
      title="Disclaimer"
      description="Research in GraineVault is an aid for exploring an idea. It is not a substitute for your own judgment or for professional advice."
    >
      <LegalSection title="What the research is for">
        <p>
          Briefs are drafted so you can see a first pass on the market,
          competitors, customers, trends, and risks. Use them to decide what
          to investigate next. The <Link href={routes.terms}>Terms</Link>{" "}
          cover how you may use the product.
        </p>
      </LegalSection>

      <LegalSection title="Professional advice">
        <p>
          Output from GraineVault is not legal, financial, investment, tax,
          accounting, or business advice. It is not a recommendation to start,
          fund, join, or drop a company, product, or market.
        </p>
        <p>
          When a decision has legal, financial, or other professional
          consequences, talk to someone qualified to advise you on that
          decision.
        </p>
      </LegalSection>

      <LegalSection title="Scores and figures">
        <p>
          Readiness scores, market sizes, growth figures, competitor notes,
          customer segments, and &quot;why now&quot; comments are model estimates. They
          can be incomplete, out of date, or wrong. A higher score means the
          draft looks more formed. It does not mean the idea will find
          customers, raise money, or succeed.
        </p>
      </LegalSection>

      <LegalSection title="Sources and web search">
        <p>
          Free and Pro research can use web search. A Pro brief may list links
          that came back from that search. A link means the model cited a
          page. It does not mean GraineVault endorses the page, that the page
          is accurate, or that the page still says what it said when the brief
          was written.
        </p>
        <LegalList>
          <li>Open the source and read it yourself before you rely on it.</li>
          <li>Treat precise numbers that you have not checked as provisional.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Your decision">
        <p>
          You decide what to do with an idea. GraineVault does not take part
          in that decision and does not guarantee an outcome. Check important
          claims with your own research.
        </p>
      </LegalSection>

      <LegalSection title="No warranty on the output">
        <p>
          Research is provided as generated. There is no promise that a brief
          is complete, current, or fit for a particular business decision.
          Availability of the product is covered in the Terms.
        </p>
      </LegalSection>

      <LegalRelated current={routes.disclaimer} />
    </LegalShell>
  );
}