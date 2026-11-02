import { createFileRoute } from "@tanstack/react-router";

import { CaseStudy } from "@/components/case-study";
import { cases } from "@/data/cases";
import { absoluteUrl } from "@/lib/seo";

const title = "Ministeriets AI-Platform — FARDA";
const description =
  "En AI-læringsplatform til danske ungdomsuddannelser, designet til at styrke elevernes tænkning i stedet for at erstatte den.";
const url = absoluteUrl("/work/ministeriets-ai-platform");

export const Route = createFileRoute("/work/ministeriets-ai-platform")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: url }],
  }),
  component: MinisterietsAiPlatform,
});

function MinisterietsAiPlatform() {
  return (
    <CaseStudy
      project={cases[1]}
      imageAlt="Ministeriets AI-Platform preview"
      heading="AI, der styrker tænkning i stedet for at erstatte den."
      linkLabel="Besøg platformen"
    >
      <p>
        Generativ AI gør det meget let for elever at overlade selve tænkningen til en chatbot. STX-,
        HTX- og HHX-skoler har ikke brug for endnu en svarmaskine — de har brug for AI, der styrker
        læring i stedet for at kortslutte den.
      </p>
      <p>
        Jeg designede og prototypede en “scaffolding AI” bygget på to idéer: Friction by Design,
        hvor produktiv modstand bevidst erstatter øjeblikkelige svar, og den sokratiske metode, hvor
        AI’en stiller spørgsmål og guider i stedet for at løse opgaven.
      </p>
      <p>
        Resultatet er en fungerende, deployed prototype og en account-baseret webapp, som elever kan
        oprette sig på og udforske frit. Projektet blev bygget i Next.js og Claude Code som mit
        hovedeksamensprojekt i multimediedesign.
      </p>
    </CaseStudy>
  );
}
