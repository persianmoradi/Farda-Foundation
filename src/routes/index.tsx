import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Code2,
  Compass,
  ExternalLink,
  Menu,
  MessageCircle,
  PenTool,
  Rocket,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";

import heroAnimation from "@/assets/hero-vid.mp4";
import pmPic from "@/assets/pm-pic.jpg";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { cases } from "@/data/cases";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { absoluteUrl } from "@/lib/seo";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "FARDA",
  url: absoluteUrl("/"),
  description: "FARDA bygger hurtige, præcise digitale oplevelser for ambitiøse virksomheder.",
  founder: {
    "@type": "Person",
    name: "Persian Moradi",
  },
  areaServed: "DK",
  knowsLanguage: ["da", "en"],
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FARDA — Build tomorrow" },
      {
        name: "description",
        content: "FARDA bygger hurtige, præcise digitale oplevelser for ambitiøse virksomheder.",
      },
      { property: "og:title", content: "FARDA — Build tomorrow" },
      {
        property: "og:description",
        content: "Et digitalt studio for virksomheder, der vil stå skarpere i morgen.",
      },
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
    number: "01",
    title: "FARDA Essential",
    price: "3.500 kr.",
    description:
      "For virksomheder, der ønsker en lynhurtig, moderne og fuldt professionel digital tilstedeværelse.",
    features: ["3-4 sider", "Responsivt UI-design", "Grundlæggende SEO", "Performance-optimering"],
    metrics: [
      { label: "Leveringstid", value: 90 },
      { label: "Design", value: 80 },
      { label: "SEO", value: 65 },
    ],
    featured: false,
    icon: Zap,
  },
  {
    number: "02",
    title: "FARDA Advanced",
    price: "8.000 kr.",
    description:
      "Kompleks digital løsning med skræddersyet UI/UX, interaktivitet og udvidet funktionalitet.",
    features: [
      "Alt fra Essential",
      "Udvidet sidetal",
      "Custom animationer",
      "Udvidet SEO",
      "API / Maps-integrationer",
    ],
    metrics: [
      { label: "Skræddersyet UX", value: 98 },
      { label: "Interaktivitet", value: 92 },
      { label: "Integrationer", value: 88 },
    ],
    featured: true,
    icon: Sparkles,
  },
];

const valuePillars = [
  {
    icon: MessageCircle,
    title: "Direkte linje",
    description:
      "Du taler direkte med den, der designer og koder din løsning — ingen account managers, ingen mellemled.",
  },
  {
    icon: Zap,
    title: "Hurtig levering",
    description:
      "En strømlinet proces og moderne værktøjer betyder uger fra idé til lancering — ikke måneder.",
  },
  {
    icon: TrendingUp,
    title: "Bygget til at vokse",
    description:
      "Kode og arkitektur bygget som et fundament, din forretning kan vokse videre på — ikke en skabelon, du vokser fra.",
  },
];

const processSteps = [
  {
    icon: Compass,
    label: "Strategi",
    description: "Vi kortlægger mål, målgruppe og de rigtige funktioner.",
  },
  { icon: PenTool, label: "Design", description: "Skarpt UI/UX, skræddersyet til din forretning." },
  { icon: Code2, label: "Udvikling", description: "Solid, moderne kode bygget til performance." },
  { icon: Rocket, label: "Lancering", description: "Live, testet og klar til at skalere." },
];

function Index() {
  const heroRef = useRef<HTMLElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [calendarLoaded, setCalendarLoaded] = useState(false);

  useScrollReveal();

  useEffect(() => {
    const hero = heroRef.current;
    const video = heroVideoRef.current;
    if (!hero || !video) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePlayback = (visible: boolean) => {
      if (reducedMotion.matches || !visible || document.hidden) {
        video.pause();
        return;
      }
      void video.play().catch(() => undefined);
    };
    const observer = new IntersectionObserver(
      ([entry]) => updatePlayback(Boolean(entry?.isIntersecting)),
      { threshold: 0.05 },
    );
    const onVisibilityChange = () => updatePlayback(hero.getBoundingClientRect().bottom > 0);

    observer.observe(hero);
    document.addEventListener("visibilitychange", onVisibilityChange);
    reducedMotion.addEventListener("change", onVisibilityChange);
    updatePlayback(true);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reducedMotion.removeEventListener("change", onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setCalendarLoaded(true), 6000);
    return () => window.clearTimeout(timer);
  }, []);

  const handleAnchorClick = (event: MouseEvent<HTMLElement>) => {
    const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (
      !anchor ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const hash = anchor.getAttribute("href");
    if (!hash || hash === "#") return;
    const target = document.querySelector<HTMLElement>(hash);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  return (
    <main id="main-content" className="site-shell" onClick={handleAnchorClick}>
      <header className="site-header">
        <div className="nav-shell">
          <a href="#top" className="wordmark" aria-label="FARDA forside">
            FARDA<span className="text-primary">.</span>
          </a>
          <nav className="hero-nav" aria-label="Primær navigation">
            <a className="nav-link" href="#services">
              Services
            </a>
            <a className="nav-link" href="#cases">
              Cases
            </a>
            <a className="nav-link" href="#about">
              Hvorfor FARDA
            </a>
            <a className="nav-link" href="#booking">
              Kontakt
            </a>
          </nav>
          <Button
            variant="icon"
            size="icon"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? "Luk menu" : "Åbn menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </Button>
        </div>
        <nav
          id="mobile-navigation"
          className="mobile-navigation"
          data-open={mobileMenuOpen}
          aria-label="Mobil navigation"
        >
          <a href="#services" onClick={() => setMobileMenuOpen(false)}>
            Services
          </a>
          <a href="#cases" onClick={() => setMobileMenuOpen(false)}>
            Cases
          </a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>
            Hvorfor FARDA
          </a>
          <a href="#booking" onClick={() => setMobileMenuOpen(false)}>
            Kontakt
          </a>
        </nav>
      </header>

      <section id="top" className="hero-section" ref={heroRef}>
        <div className="hero-media" aria-hidden="true">
          <video
            ref={heroVideoRef}
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            width={1920}
            height={1080}
          >
            <source src={heroAnimation} type="video/mp4" />
          </video>
        </div>
        <div className="hero-scrim" aria-hidden="true" />
        <div className="hero-title-wrap">
          <p className="hero-kicker hero-enter hero-enter-kicker">Digitalt studio · København</p>
          <h1 className="hero-title hero-enter hero-enter-title">
            BUILD
            <br />
            <span>TOMORROW</span>
          </h1>
          <div className="hero-support-panel hero-enter hero-enter-bottom">
            <p>Vi skaber distinkte digitale oplevelser for virksomheder med noget på spil.</p>
          </div>
        </div>
        <Button
          asChild
          variant="primary"
          size="lg"
          className="hero-enter-button hero-enter hero-enter-bottom"
        >
          <a href="#booking">
            <span>Book en samtale</span>
            <span className="hero-cta-arrow">
              <ArrowRight size={18} />
            </span>
          </a>
        </Button>
        <a
          href="#services"
          className="scroll-cue hero-enter hero-enter-cue"
          aria-label="Se vores services"
        >
          <span>Scroll</span>
          <i aria-hidden="true" />
        </a>
        <p className="hero-edition hero-enter hero-enter-cue">FARDA · 2026</p>
      </section>

      <section id="services" className="section-light px-page py-section">
        <div className="section-label reveal">
          <span>Services</span>
        </div>
        <div className="services-intro reveal">
          <h2>
            Fra første tanke
            <br />
            til færdigt format.
          </h2>
          <p>Strategi, design og udvikling samlet i ét fokuseret forløb.</p>
        </div>
        <div className="package-grid">
          {packages.map((item) => (
            <article
              key={item.title}
              className={`package-card ${item.featured ? "package-card-featured" : ""} reveal reveal-card`}
            >
              <span className="package-number-mark" aria-hidden="true">
                {item.number}
              </span>
              <div className="package-top">
                <span className="package-icon-badge" aria-hidden="true">
                  <item.icon size={18} />
                </span>
                <span
                  className={`package-status ${item.featured ? "package-status-featured" : ""}`}
                >
                  {item.featured ? "Mest valgt" : "Fast foundation"}
                </span>
              </div>
              <div className="package-content">
                <h3>{item.title}</h3>
                <p className="package-price">{item.price}</p>
                <p className="package-description">{item.description}</p>
              </div>
              <ul className="metric-list" aria-hidden="true">
                {item.metrics.map((metric, index) => (
                  <li
                    key={metric.label}
                    className="metric-row"
                    style={
                      { "--metric-index": index, "--metric-value": metric.value } as CSSProperties
                    }
                  >
                    <span className="metric-label">{metric.label}</span>
                    <span className="metric-track">
                      <span className="metric-fill" />
                    </span>
                  </li>
                ))}
              </ul>
              <ul className="feature-list">
                {item.features.map((feature, index) => (
                  <li key={feature} style={{ "--feature-index": index } as CSSProperties}>
                    <Check size={16} />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="cases" className="section-dark px-page py-section">
        <div className="cases-inner">
          <div className="section-label section-label-dark reveal">
            <span>Cases</span>
          </div>
          <div className="cases-heading reveal">
            <h2>
              Arbejde med
              <br />
              <span>en klar retning.</span>
            </h2>
            <p>Digitale løsninger med strategi, form og funktion i samme system.</p>
          </div>
          <div className="case-grid">
            {cases.map((item) => (
              <Link
                key={item.id}
                className={`case-card reveal reveal-card ${item.accent}`}
                to={item.path}
              >
                <span className="case-card-top">
                  <span>FARDA selected work</span>
                  <span>{item.number}</span>
                </span>
                <span className="case-preview" aria-hidden="true">
                  <img src={item.image} alt="" />
                </span>
                <span className="case-card-content">
                  <span className="case-meta">{item.category}</span>
                  <span className="case-card-title">
                    <strong>{item.title}</strong>
                    <span className="case-action">
                      <ArrowRight size={19} />
                    </span>
                  </span>
                  <span className="case-card-description">{item.description}</span>
                </span>
              </Link>
            ))}
          </div>
          <div className="case-footer reveal" aria-hidden="true">
            <span>FARDA Selected work</span>
            <i />
            <span>2026</span>
          </div>
        </div>
      </section>

      <section id="about" className="section-light px-page py-section why-section">
        <div className="section-label reveal">
          <span>Hvorfor FARDA</span>
        </div>
        <div className="why-intro reveal">
          <h2>
            Et fundament bygget til
            <br />
            at <span className="text-primary">vokse med dig</span>.
          </h2>
          <p>
            Ingen bureau-lag, ingen skabeloner. Bare et stærkt digitalt fundament, bygget direkte af
            den, der forstår både design og kode.
          </p>
        </div>

        <div className="why-pillars">
          {valuePillars.map((pillar, index) => (
            <div
              key={pillar.title}
              className="why-pillar reveal reveal-card"
              style={{ "--feature-index": index } as CSSProperties}
            >
              <span className="why-pillar-icon">
                <pillar.icon size={20} aria-hidden="true" />
              </span>
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
            </div>
          ))}
        </div>

        <div className="why-process reveal">
          <div className="why-process-line" aria-hidden="true">
            <span className="why-process-line-fill" />
          </div>
          <ol className="why-process-steps">
            {processSteps.map((step, index) => (
              <li
                key={step.label}
                className="why-process-step"
                style={{ "--feature-index": index } as CSSProperties}
              >
                <span className="why-process-icon">
                  <step.icon size={18} aria-hidden="true" />
                </span>
                <strong>{step.label}</strong>
                <span>{step.description}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="why-cta reveal">
          <Button asChild variant="primary" size="lg">
            <a href="#booking">
              <span>Book en samtale</span>
              <ArrowRight size={17} />
            </a>
          </Button>
          <div className="why-trust">
            <img
              src={pmPic}
              alt="Persian Moradi, founder of FARDA"
              width={96}
              height={96}
              loading="lazy"
              decoding="async"
            />
            <span>
              <strong>Persian Moradi</strong>
              <span>Din direkte kontakt — Founder &amp; Full-stack Builder</span>
            </span>
          </div>
        </div>
      </section>

      <section id="booking" className="booking-section px-page py-section">
        <div className="booking-copy reveal">
          <div className="section-label section-label-dark">
            <span>Næste skridt</span>
          </div>
          <h2>Start din rejse.</h2>
          <p>Lad os drøfte dine ønsker og muligheder om dit næste digitale skridt.</p>
          <ul className="calendar-facts calendar-facts-dark">
            <li>15–30 minutter</li>
            <li>Ingen binding</li>
            <li>Dansk / Engelsk</li>
          </ul>
          <div className="booking-contact-meta">
            <span className="footer-label">Direkte kontakt</span>
            <a href="mailto:farda0@protonmail.com">farda0@protonmail.com</a>
          </div>
        </div>
        <div className="calendar-shell reveal reveal-late">
          <div className="calendar-heading">
            <span className="calendar-heading-label">Book tid</span>
            <span className="calendar-heading-status">Svar inden for 24 timer</span>
          </div>
          <div className="calendar-frame" data-loaded={calendarLoaded}>
            <div className="calendar-loading" aria-hidden={calendarLoaded}>
              <span />
              <p>Indlæser kalender…</p>
            </div>
            <iframe
              src="https://cal.com/farda?embed=true&theme=light&name=&email="
              title="Book en samtale med FARDA"
              loading="lazy"
              onLoad={() => setCalendarLoaded(true)}
            />
          </div>
          <a
            className="calendar-fallback"
            href="https://cal.com/farda?name=&email="
            target="_blank"
            rel="noreferrer"
          >
            Åbn i nyt vindue <ExternalLink size={15} />
          </a>
        </div>
      </section>

      <SiteFooter isHome />
    </main>
  );
}
