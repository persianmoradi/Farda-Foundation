import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

import { Lines } from "@/components/chapter";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { cases, type Case } from "@/data/cases";
import { useJourney } from "@/hooks/use-journey";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

type CaseStudyProps = {
  project: Case;
  imageAlt: string;
  heading: string;
  linkLabel: string;
  children: ReactNode;
};

export function CaseStudy({ project, imageAlt, heading, linkLabel, children }: CaseStudyProps) {
  useScrollReveal();
  useJourney();

  const index = cases.findIndex((item) => item.id === project.id);
  const next = cases[(index + 1) % cases.length] ?? cases[0];

  return (
    <main id="main-content" className="site-shell case-page">
      <SiteHeader />

      <section className="case-hero px-page">
        <div className="case-hero-inner">
          <Link className="case-back-link" to="/" hash="cases">
            <ArrowLeft size={16} />
            Tilbage til cases
          </Link>
          <span className="case-hero-number reveal">
            Destination {project.number} / {String(cases.length).padStart(2, "0")}
          </span>
          <p className="case-meta reveal">{project.category}</p>
          <h1 className="case-hero-title reveal">
            <Lines lines={[project.title]} />
          </h1>
          <p className="case-hero-intro reveal">{project.description}</p>
        </div>
        <span className="case-hero-numeral" aria-hidden="true">
          {project.number}
        </span>
      </section>

      <section className="case-body px-page py-section">
        <div className="case-visual reveal" data-depth>
          <div className={`case-visual-frame ${project.accent}`} data-tilt="4">
            <img src={project.image} alt={imageAlt} />
            <span className="card-glare" aria-hidden="true" />
          </div>
        </div>
        <article className="case-copy reveal" data-depth>
          <span className="case-copy-eyebrow">Projektet</span>
          <h2>{heading}</h2>
          {children}
          <div className="case-page-links">
            <a href={project.websiteUrl} target="_blank" rel="noreferrer">
              {linkLabel} <ExternalLink size={15} />
            </a>
          </div>
        </article>
      </section>

      <section className="case-next px-page">
        <Link className="case-next-link reveal" to={next.path} data-depth>
          <span className="case-next-label">Næste destination</span>
          <span className="case-next-title">
            {next.title}
            <ArrowRight size={34} />
          </span>
          <span className="case-meta">{next.category}</span>
        </Link>
      </section>

      <SiteFooter />
    </main>
  );
}
