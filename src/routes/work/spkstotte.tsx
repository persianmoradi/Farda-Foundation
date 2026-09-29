import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { cases } from "@/data/cases";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
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
  const project = cases[0];

  return (
    <main className="site-shell case-page">
      <SiteHeader />

      <section className="case-page-hero section-dark px-page py-section">
        <div className="case-page-hero-inner">
          <Link className="case-back-link" to="/" hash="cases">
            <ArrowLeft size={16} />
            Tilbage til cases
          </Link>
          <span className="case-page-number">{project.number} / FARDA selected work</span>
          <p className="case-meta">{project.category}</p>
          <h1>{project.title}</h1>
          <p className="case-page-intro">{project.description}</p>
        </div>
      </section>

      <section className="case-page-content section-light px-page py-section">
        <div className="case-page-grid">
          <div className={`case-page-placeholder ${project.accent}`}>
            <img src={project.image} alt="SPK Støtte website preview" />
          </div>
          <article className="case-page-copy">
            <span className="about-eyebrow">Projektet</span>
            <h2>En digital platform med ro, retning og tillid.</h2>
            <p>
              SPK Støtte arbejder med støtteforløb, faglige metoder og samarbejde med kommuner.
              Derfor skulle hjemmesiden føles tydelig, imødekommende og professionel fra første
              øjeblik.
            </p>
            <p>
              Jeg designede og byggede en hurtig, SEO-optimeret hjemmeside i Next.js med en klar
              informationsarkitektur. Hver service blev koblet til sit juridiske grundlag, og
              indholdet blev organiseret omkring en enkel fem-trins proces, metoderne og samarbejdet
              med kommunerne.
            </p>
            <p>
              Den visuelle retning er bevidst rolig og institutionel, så indholdet får plads, og
              brugeren hurtigt kan forstå både tilbuddet og næste skridt.
            </p>
            <div className="case-page-links">
              <a href={project.websiteUrl} target="_blank" rel="noreferrer">
                Besøg website <ExternalLink size={15} />
              </a>
            </div>
          </article>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
