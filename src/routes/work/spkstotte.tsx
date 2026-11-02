import { createFileRoute } from "@tanstack/react-router";

import { CaseStudy } from "@/components/case-study";
import { cases } from "@/data/cases";
import { absoluteUrl } from "@/lib/seo";

const title = "SPK Støtte — FARDA";
const description =
  "En hurtig, SEO-optimeret hjemmeside for SPK Støtte med tydelig informationsarkitektur og en rolig, institutionel visuel retning.";
const url = absoluteUrl("/work/spkstotte");

export const Route = createFileRoute("/work/spkstotte")({
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
  component: SpkStotte,
});

function SpkStotte() {
  return (
    <CaseStudy
      project={cases[0]}
      imageAlt="SPK Støtte website preview"
      heading="En digital platform med ro, retning og tillid."
      linkLabel="Besøg website"
    >
      <p>
        SPK Støtte arbejder med støtteforløb, faglige metoder og samarbejde med kommuner. Derfor
        skulle hjemmesiden føles tydelig, imødekommende og professionel fra første øjeblik.
      </p>
      <p>
        Jeg designede og byggede en hurtig, SEO-optimeret hjemmeside i Next.js med en klar
        informationsarkitektur. Hver service blev koblet til sit juridiske grundlag, og indholdet
        blev organiseret omkring en enkel fem-trins proces, metoderne og samarbejdet med kommunerne.
      </p>
      <p>
        Den visuelle retning er bevidst rolig og institutionel, så indholdet får plads, og brugeren
        hurtigt kan forstå både tilbuddet og næste skridt.
      </p>
    </CaseStudy>
  );
}
