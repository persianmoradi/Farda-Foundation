import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { cases, type Case } from "@/data/cases";

type CaseStudyProps = {
  project: Case;
  imageAlt: string;
  heading: string;
  linkLabel: string;
  children: ReactNode;
};

export function CaseStudy({ project, imageAlt, heading, linkLabel, children }: CaseStudyProps) {
  const index = cases.findIndex((item) => item.id === project.id);
  const next = cases[(index + 1) % cases.length] ?? cases[0];

  return (
    <main id="main-content" className="site-shell case-page">
      <SiteHeader />

      <section className="case-hero">
        <div className="wrap">
          <Link className="link case-back" to="/" hash="cases">
            <ArrowLeft size={15} aria-hidden="true" /> Alle cases
          </Link>
          <p className="mono case-hero-meta">
            Case {project.number} — {project.category}
          </p>
          <h1 className="case-hero-title">{project.title}</h1>
          <p className="case-hero-intro">{project.description}</p>
        </div>
      </section>

      <section className="case-content">
        <div className="wrap case-grid">
          <div className="case-shot panel">
            <img src={project.image} alt={imageAlt} width={1600} height={1100} />
          </div>
          <article className="case-copy panel">
            <h2>{heading}</h2>
            {children}
            <a
              className="btn btn-primary"
              href={project.websiteUrl}
              target="_blank"
              rel="noreferrer"
            >
              {linkLabel} <ExternalLink size={15} aria-hidden="true" />
            </a>
          </article>
        </div>
      </section>

      <section className="case-next">
        <div className="wrap">
          <Link className="case-next-link" to={next.path}>
            <span className="mono">Næste case</span>
            <span className="case-next-title">
              {next.title} <ArrowRight size={32} aria-hidden="true" />
            </span>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
