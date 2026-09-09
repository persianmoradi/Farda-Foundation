import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { cases } from "@/data/cases";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/work/ministeriets-ai-platform")({
  head: () => ({
    meta: [
      { title: "Ministeriets AI-Platform — FARDA" },
      {
        name: "description",
        content:
          "En AI-læringsplatform til danske ungdomsuddannelser, designet til at styrke elevernes tænkning i stedet for at erstatte den.",
      },
    ],
  }),
  component: MinisterietsAiPlatform,
});

function MinisterietsAiPlatform() {
  const project = cases[1];

  return (
    <main className="site-shell case-page">
      <header className="site-header">
        <div className="nav-shell">
          <a href="/" className="wordmark" aria-label="FARDA forside">
            FARDA<span className="text-primary">.</span>
          </a>
          <nav className="hero-nav" aria-label="Primær navigation">
            <a className="nav-link" href="/#services">
              Services
            </a>
            <a className="nav-link" href="/#cases">
              Cases
            </a>
            <a className="nav-link" href="/#about">
              Om FARDA
            </a>
            <a className="nav-link" href="/#booking">
              Kontakt
            </a>
          </nav>
        </div>
      </header>

      <section className="case-page-hero section-dark px-page py-section">
        <div className="case-page-hero-inner">
          <a className="case-back-link" href="/#cases">
            <ArrowLeft size={16} />
            Tilbage til cases
          </a>
          <span className="case-page-number">{project.number} / FARDA selected work</span>
          <p className="case-meta">{project.category}</p>
          <h1>{project.title}</h1>
          <p className="case-page-intro">{project.description}</p>
        </div>
      </section>

      <section className="case-page-content section-light px-page py-section">
        <div className="case-page-grid">
          <div className={`case-page-placeholder ${project.accent}`}>
            <img src={project.image} alt="Ministeriets AI-Platform preview" />
          </div>
          <article className="case-page-copy">
            <span className="about-eyebrow">Projektet</span>
            <h2>AI, der styrker tænkning i stedet for at erstatte den.</h2>
            <p>
              Generativ AI gør det meget let for elever at overlade selve tænkningen til en chatbot.
              STX-, HTX- og HHX-skoler har ikke brug for endnu en svarmaskine — de har brug for AI,
              der styrker læring i stedet for at kortslutte den.
            </p>
            <p>
              Jeg designede og prototypede en “scaffolding AI” bygget på to idéer: Friction by
              Design, hvor produktiv modstand bevidst erstatter øjeblikkelige svar, og den
              sokratiske metode, hvor AI’en stiller spørgsmål og guider i stedet for at løse
              opgaven.
            </p>
            <p>
              Resultatet er en fungerende, deployed prototype og en account-baseret webapp, som
              elever kan oprette sig på og udforske frit. Projektet blev bygget i Next.js og Claude
              Code som mit hovedeksamensprojekt i multimediedesign.
            </p>
            <div className="case-page-links">
              <a href={project.websiteUrl} target="_blank" rel="noreferrer">
                Besøg platformen <ExternalLink size={15} />
              </a>
            </div>
          </article>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
