import { createFileRoute, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { useEffect, useState, type CSSProperties, type MouseEvent } from "react";

import pmPic from "@/assets/pm-pic.webp";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { cases } from "@/data/cases";
import { absoluteUrl } from "@/lib/seo";
import { scrollToTarget } from "@/lib/smooth-scroll";

const description =
  "FARDA designer og koder hurtige websites og webapps for virksomheder. Fra 3.500 kr., direkte med udvikleren, fra København.";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "FARDA",
  url: absoluteUrl("/"),
  description,
  founder: { "@type": "Person", name: "Persian Moradi" },
  areaServed: "DK",
  knowsLanguage: ["da", "en"],
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FARDA — Websites og webapps fra København" },
      { name: "description", content: description },
      { property: "og:title", content: "FARDA — Websites og webapps fra København" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/") },
      { name: "twitter:card", content: "summary" },
      { "script:ld+json": organizationJsonLd },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/") }],
  }),
  component: Index,
});

const packages = [
  {
    sheet: "A-01",
    title: "FARDA Essential",
    price: "3.500",
    description: "En hurtig, moderne og professionel hjemmeside til virksomheder, der skal online.",
    features: ["3–4 sider", "Responsivt UI-design", "Grundlæggende SEO", "Performance-optimering"],
    featured: false,
  },
  {
    sheet: "A-02",
    title: "FARDA Advanced",
    price: "8.000",
    description: "Skræddersyet UI/UX med interaktivitet og funktioner bygget til din forretning.",
    features: [
      "Alt fra Essential",
      "Udvidet sidetal",
      "Custom animationer",
      "Udvidet SEO",
      "API- og Maps-integrationer",
    ],
    featured: true,
  },
];

const pillars = [
  {
    title: "Taler direkte med udvikleren",
    text: "Ingen account managers og ingen mellemled. Den, du taler med, er den, der bygger.",
  },
  {
    title: "Lancerer på uger",
    text: "En strømlinet proces og moderne værktøjer fra idé til lancering — ikke måneder.",
  },
  {
    title: "Bygger kode, der kan vokse",
    text: "Et fundament din forretning kan bygge videre på, ikke en skabelon du vokser fra.",
  },
];

const steps = [
  { label: "Strategi", text: "Mål, målgruppe og de rigtige funktioner." },
  { label: "Design", text: "UI og UX skræddersyet til din forretning." },
  { label: "Udvikling", text: "Moderne kode bygget til performance." },
  { label: "Lancering", text: "Live, testet og klar til at skalere." },
];

function Eyebrow({ phase, label }: { phase: string; label: string }) {
  return (
    <p className="eyebrow">
      <span className="eyebrow-phase">{phase}</span>
      <span className="eyebrow-line" aria-hidden="true" />
      <span>{label}</span>
    </p>
  );
}

const EMAIL = "farda0@protonmail.com";

const contactSteps = [
  { title: "Skriv din vision", text: "En mail om din idé, dine mål og din tidsplan." },
  { title: "Svar inden for 24 timer", text: "Vi vender tilbage og foreslår et tidspunkt." },
  { title: "Uforpligtende møde", text: "Vi taler løsningen igennem. Du beslutter bagefter." },
];

/** Opens the visitor's mail with a short outline, so the vision is easy to put into words. */
const MAIL_HREF = `mailto:${EMAIL}?subject=${encodeURIComponent(
  "Min vision",
)}&body=${encodeURIComponent(
  "Hej FARDA,\n\nMin vision:\n\n\nHvad skal løsningen kunne:\n\n\nHvornår skal den gerne være klar:\n\n\nHvornår passer det dig at mødes:\n",
)}`;

/** Lights the new building's windows while the visitor is about to write. */
const glow = (on: boolean) => window.dispatchEvent(new CustomEvent("farda:glow", { detail: on }));

function ContactActions() {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  const glowProps = {
    onPointerEnter: () => glow(true),
    onPointerLeave: () => glow(false),
    onFocus: () => glow(true),
    onBlur: () => glow(false),
  };

  return (
    <div className="contact-actions">
      <a className="contact-mail" href={`mailto:${EMAIL}`} {...glowProps}>
        {EMAIL}
      </a>
      <div className="contact-buttons">
        <a className="btn btn-primary" href={MAIL_HREF} {...glowProps}>
          <Mail size={17} aria-hidden="true" /> Skriv din vision
        </a>
        <button type="button" className="btn btn-ghost" onClick={copy} {...glowProps}>
          {copied ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
          {copied ? "Kopieret" : "Kopiér adressen"}
        </button>
        <span className="sr-only" aria-live="polite">
          {copied ? "Mailadressen er kopieret" : ""}
        </span>
      </div>
    </div>
  );
}

function Index() {
  // Links like "Tilbage til cases" arrive as /#cases. Once the router has scrolled there, tidy
  // the address back to / so the hash doesn't linger (or send a later refresh back there).
  const hash = useLocation({ select: (location) => location.hash });
  const navigate = useNavigate();
  useEffect(() => {
    if (!hash) return;
    const timer = window.setTimeout(
      () => void navigate({ to: "/", replace: true, resetScroll: false }),
      1200,
    );
    return () => window.clearTimeout(timer);
  }, [hash, navigate]);

  const handleAnchorClick = (event: MouseEvent<HTMLElement>) => {
    const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!anchor || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const target = document.querySelector<HTMLElement>(anchor.getAttribute("href") || "#_");
    if (!target) return;
    event.preventDefault();
    scrollToTarget(target);
  };

  return (
    <main id="main-content" className="site-shell" onClick={handleAnchorClick}>
      <SiteHeader isHome />

      {/* 00 — I dag: فردا floats in the night */}
      <section id="top" className="hero" data-phase="0">
        <div className="wrap hero-wrap">
          <div className="hero-copy">
            <h1 className="hero-title enter" style={{ "--i": 1 } as CSSProperties}>
              Websites og webapps til virksomheder, der bygger til <em>i morgen</em>.
            </h1>
            <p className="hero-sub enter" style={{ "--i": 2 } as CSSProperties}>
              FARDA er et digitalt studio i København. Du arbejder direkte med den, der designer og
              koder din løsning — fra første skitse til lancering.
            </p>
            <div className="hero-actions enter" style={{ "--i": 3 } as CSSProperties}>
              <a href="#kontakt" className="btn btn-primary">
                Kontakt FARDA <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a href="#services" className="btn btn-ghost">
                Se priserne
              </a>
            </div>
          </div>
          <dl className="hero-facts enter" style={{ "--i": 4 } as CSSProperties}>
            <div>
              <dt>Websites fra</dt>
              <dd>3.500 kr.</dd>
            </div>
            <div>
              <dt>Svar inden for</dt>
              <dd>24 timer</dd>
            </div>
            <div>
              <dt>Sprog</dt>
              <dd>Dansk · Engelsk</dd>
            </div>
          </dl>
        </div>
        <a href="#services" className="scroll-cue" aria-label="Scroll til priserne">
          <span>Scroll, og se fundamentet blive bygget</span>
          <i aria-hidden="true" />
        </a>
      </section>

      {/* 01 — Strategi: the letters fall into a blueprint */}
      <section id="services" className="section section-right" data-phase="1">
        <div className="wrap section-grid">
          <div className="section-col">
            <Eyebrow phase="01" label="Strategi" />
            <h2 className="section-title">Pakker og priser</h2>
            <p className="section-lead">
              Strategi, design og udvikling i ét forløb. Vælg niveauet, der passer til din
              virksomhed i dag.
            </p>
            <div className="sheets">
              {packages.map((item) => (
                <article
                  key={item.title}
                  className={`sheet panel ${item.featured ? "sheet-featured" : ""}`}
                >
                  <header className="sheet-head">
                    <span className="mono">{item.sheet}</span>
                    {item.featured && <span className="sheet-flag">Mest valgt</span>}
                  </header>
                  <h3 className="sheet-title">{item.title}</h3>
                  <p className="sheet-price">
                    {item.price}
                    <span> kr.</span>
                  </p>
                  <p className="sheet-text">{item.description}</p>
                  <ul className="sheet-list">
                    {item.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 02 — Design: the plan rises into a drawing of a skyline */}
      <section id="cases" className="section section-left" data-phase="2">
        <div className="wrap section-grid">
          <div className="section-col section-col-wide">
            <Eyebrow phase="02" label="Design" />
            <h2 className="section-title">Udvalgte cases</h2>
            <p className="section-lead">
              To platforme, hvor strategi, form og funktion hænger sammen i ét system.
            </p>
            <div className="cases">
              {cases.map((item) => (
                <Link key={item.id} to={item.path} className="case-card panel">
                  <span className="case-media">
                    <img
                      src={item.image}
                      alt=""
                      width={1600}
                      height={1100}
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <span className="case-body">
                    <span className="mono case-meta">
                      {item.number} — {item.category}
                    </span>
                    <strong className="case-title">{item.title}</strong>
                    <span className="case-text">{item.description}</span>
                    <span className="case-link">
                      Se casen <ArrowUpRight size={16} aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 03 — Udvikling: the city turns solid and its windows light */}
      <section id="about" className="section section-right" data-phase="3">
        <div className="wrap section-grid">
          <div className="section-col">
            <Eyebrow phase="03" label="Udvikling" />
            <h2 className="section-title">Én person fra skitse til kode</h2>
            <div className="founder panel">
              <img src={pmPic} alt="Persian Moradi" width={88} height={88} loading="lazy" />
              <span>
                <strong>Persian Moradi</strong>
                <span>
                  Founder og full-stack udvikler. Din direkte kontakt gennem hele forløbet.
                </span>
              </span>
            </div>
            <div className="about-panel panel">
              <ul className="pillars">
                {pillars.map((pillar, index) => (
                  <li key={pillar.title}>
                    <span className="mono">0{index + 1}</span>
                    <span>
                      <strong>{pillar.title}</strong>
                      <span>{pillar.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <ol className="route" aria-label="Forløbet">
                {steps.map((step, index) => (
                  <li key={step.label} className="route-step">
                    <span className="route-dot" aria-hidden="true" />
                    <span className="mono">0{index + 1}</span>
                    <strong>{step.label}</strong>
                    <span>{step.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* 04 — Lancering: the sun rises and your building goes up on the last empty plot */}
      <section id="kontakt" className="section contact" data-phase="4">
        <div className="wrap section-grid">
          <div className="contact-copy">
            <Eyebrow phase="04" label="Lancering" />
            <h2 className="section-title">Skriv din vision til os</h2>
            <p className="section-lead">
              Fortæl med dine egne ord, hvad du drømmer om at bygge. Så aftaler vi et uforpligtende
              møde, hvor vi sammen finder vejen dertil.
            </p>
            <ContactActions />
            <ol className="contact-steps panel" aria-label="Sådan kommer vi i gang">
              {contactSteps.map((step, index) => (
                <li key={step.title}>
                  <span className="mono">0{index + 1}</span>
                  <strong>{step.title}</strong>
                  <span>{step.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <SiteFooter isHome />
    </main>
  );
}
