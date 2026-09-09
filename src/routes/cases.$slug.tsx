import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { getCaseStudy, getNextCaseStudy } from "@/lib/cases";

export const Route = createFileRoute("/cases/$slug")({
  loader: ({ params }) => {
    const study = getCaseStudy(params.slug);
    if (!study) throw notFound();
    return study;
  },
  head: ({ params, loaderData }) => {
    const title = loaderData ? `${loaderData.name} — Case | FARDA` : "Case ikke fundet — FARDA";
    const description = loaderData?.description ?? "Den ønskede FARDA-case kunne ikke findes.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/cases/${params.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/cases/${params.slug}` }],
    };
  },
  component: CaseDetailPage,
  notFoundComponent: CaseNotFound,
});

function CaseDetailPage() {
  const study = Route.useLoaderData();
  const nextStudy = getNextCaseStudy(study.slug);
  useScrollReveal();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [study.slug]);

  return (
    <main id="main-content" className="case-page overflow-x-clip">
      <header className="case-header px-page">
        <Link to="/" className="wordmark" aria-label="FARDA forside">FARDA<span className="text-primary">.</span></Link>
        <Link to="/" hash="cases" className="case-back"><ArrowLeft size={16} /><span>Alle cases</span></Link>
        <Button asChild variant="outline" className="case-header-cta">
          <Link to="/" hash="booking">Book samtale <ArrowRight size={15} /></Link>
        </Button>
      </header>

      <article>
        <section className="case-detail-hero px-page">
          <div className="case-detail-heading">
            <div className="case-detail-eyebrow"><span>Case study</span><span>{study.year}</span></div>
            <h1>{study.name}</h1>
            <p>{study.statement}</p>
          </div>
          <div className="case-detail-cover">
            <img src={study.image} alt={`${study.name} — ${study.category}`} width={1536} height={1024} fetchPriority="high" decoding="async" />
          </div>
        </section>

        <dl className="case-facts px-page reveal" aria-label="Projektinformation">
          {[
            ["Kunde", study.client],
            ["Discipliner", study.scope],
            ["Levering", study.delivery],
            ["År", study.year],
          ].map(([label, value]) => (
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>

        <section className="case-narrative px-page">
          <div className="case-narrative-intro reveal">
            <span>01 — Udfordringen</span>
            <h2>{study.description}</h2>
          </div>
          <p className="case-narrative-copy reveal reveal-late">{study.challenge}</p>
        </section>

        <section className="case-gallery px-page">
          <figure className="case-gallery-large reveal"><img src={study.gallery[0]} alt={`${study.name} visuel retning`} loading="lazy" decoding="async" width={1536} height={1024} /></figure>
          <div className="case-gallery-story reveal reveal-late">
            <span>02 — Retningen</span>
            <h2>En retning med plads til det væsentlige.</h2>
            <p>{study.direction}</p>
          </div>
        </section>

        <section className="case-solution px-page">
          <div className="case-solution-copy reveal">
            <span>03 — Løsningen</span>
            <h2>Designet som ét sammenhængende system.</h2>
            <p>{study.solution}</p>
          </div>
          <figure className="case-solution-media reveal reveal-late"><img src={study.gallery[1]} alt={`${study.name} digital løsning`} loading="lazy" decoding="async" width={1536} height={1024} /></figure>
        </section>

        <section className="case-outcome px-page">
          <div className="case-outcome-label reveal"><span>04</span><span>Resultat</span></div>
          <p className="reveal reveal-late">{study.outcome}</p>
        </section>
      </article>

      {nextStudy ? (
        <Link to="/cases/$slug" params={{ slug: nextStudy.slug }} className="next-case px-page">
          <span>Næste case</span>
          <div><strong>{nextStudy.name}</strong><i><ArrowRight size={24} /></i></div>
        </Link>
      ) : null}

      <section className="case-booking px-page">
        <p>Klar til næste skridt?</p>
        <h2>Lad os bygge<br />det næste.</h2>
        <Button asChild variant="primary" size="lg"><Link to="/" hash="booking">Book en samtale <ArrowRight size={17} /></Link></Button>
      </section>
    </main>
  );
}

function CaseNotFound() {
  return (
    <main id="main-content" className="case-not-found px-page">
      <p>404 · Case ikke fundet</p>
      <h1>Denne case findes ikke.</h1>
      <Button asChild variant="primary"><Link to="/" hash="cases"><ArrowLeft size={16} /> Se alle cases</Link></Button>
    </main>
  );
}