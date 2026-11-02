import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Code2,
  Compass,
  ExternalLink,
  MessageCircle,
  PenTool,
  Rocket,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";

import heroAnimation from "@/assets/hero-vid.mp4";
import pmPic from "@/assets/pm-pic.jpg";
import { ChapterMark, Lines } from "@/components/chapter";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { cases } from "@/data/cases";
import { useJourney } from "@/hooks/use-journey";
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
  const [calendarLoaded, setCalendarLoaded] = useState(false);

  useScrollReveal();
  useJourney();

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
      <SiteHeader isHome />

      <section id="top" className="hero" ref={heroRef} data-pin>
        <div className="hero-stage">
          <div className="hero-portal" aria-hidden="true">
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
            <span className="hero-portal-scrim" />
          </div>

          <div className="hero-hud" aria-hidden="true">
            <span className="hero-hud-corner hero-hud-tl">
              <i className="hero-rec" /> Kapitel 00 — Afgang
            </span>
            <span className="hero-hud-corner hero-hud-tr">55°40′N · 12°34′E</span>
            <span className="hero-hud-corner hero-hud-bl">FARDA · 2026</span>
            <span className="hero-hud-corner hero-hud-br">I dag → I morgen</span>
          </div>

          <div className="hero-copy">
            <p className="hero-kicker hero-enter" style={{ "--enter": 0 } as CSSProperties}>
              Digitalt studio · København
            </p>
            <h1 className="hero-title">
              <span className="hero-word hero-word-a">
                <span className="hero-enter" style={{ "--enter": 1 } as CSSProperties}>
                  BUILD
                </span>
              </span>
              <span className="hero-word hero-word-b">
                <span className="hero-enter" style={{ "--enter": 2 } as CSSProperties}>
                  TOMORROW
                </span>
              </span>
            </h1>
            <p className="hero-support hero-enter" style={{ "--enter": 3 } as CSSProperties}>
              Vi skaber distinkte digitale oplevelser for virksomheder med noget på spil.
            </p>
            <div className="hero-enter" style={{ "--enter": 4 } as CSSProperties}>
              <Button asChild variant="primary" size="lg" className="hero-cta">
                <a href="#booking">
                  <span>Book en samtale</span>
                  <span className="hero-cta-arrow">
                    <ArrowRight size={18} />
                  </span>
                </a>
              </Button>
            </div>
          </div>

          <a href="#services" className="scroll-cue" aria-label="Se vores services">
            <span>Begynd rejsen</span>
            <i aria-hidden="true" />
          </a>
        </div>
      </section>

      <section id="services" className="chapter px-page py-section">
        <ChapterMark number="01" label="Services" />
        <div className="chapter-intro reveal" data-depth>
          <h2 className="chapter-title">
            <Lines lines={["Fra første tanke", <em key="b">til færdigt format.</em>]} />
          </h2>
          <p>Strategi, design og udvikling samlet i ét fokuseret forløb.</p>
        </div>
        <div className="package-grid">
          {packages.map((item, cardIndex) => (
            <div
              key={item.title}
              className="depth-slot reveal"
              data-depth
              style={{ "--slot": cardIndex } as CSSProperties}
            >
              <article
                className={`package-card ${item.featured ? "package-card-featured" : ""}`}
                data-tilt="6"
              >
                <span className="card-glare" aria-hidden="true" />
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
                        {
                          "--metric-index": index,
                          "--metric-value": metric.value,
                        } as CSSProperties
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
            </div>
          ))}
        </div>
      </section>

      <section id="cases" className="chapter px-page py-section">
        <ChapterMark number="02" label="Cases" />
        <div className="chapter-intro reveal" data-depth>
          <h2 className="chapter-title">
            <Lines lines={["Arbejde med", <em key="b">en klar retning.</em>]} />
          </h2>
          <p>Digitale løsninger med strategi, form og funktion i samme system.</p>
        </div>
        <div className="destination-list">
          {cases.map((item, index) => (
            <Link
              key={item.id}
              className={`destination reveal ${index % 2 ? "destination-flip" : ""}`}
              to={item.path}
              data-depth
            >
              <span className="destination-frame" data-tilt="5">
                <span className="destination-image">
                  <img src={item.image} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="card-glare" aria-hidden="true" />
                <span className="destination-frame-hud" aria-hidden="true">
                  <span>Destination {item.number}</span>
                  <span>{item.category}</span>
                </span>
              </span>
              <span className="destination-copy">
                <span className="destination-number" aria-hidden="true">
                  {item.number}
                </span>
                <span className="case-meta">{item.category}</span>
                <strong className="destination-title">{item.title}</strong>
                <span className="destination-description">{item.description}</span>
                <span className="destination-action">
                  Se casen
                  <ArrowRight size={17} />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="about" className="chapter px-page py-section">
        <ChapterMark number="03" label="Hvorfor FARDA" />
        <div className="chapter-intro reveal" data-depth>
          <h2 className="chapter-title">
            <Lines lines={["Et fundament bygget til", <em key="b">at vokse med dig.</em>]} />
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
              className="depth-slot reveal"
              data-depth
              style={{ "--slot": index } as CSSProperties}
            >
              <div className="why-pillar" data-tilt="7">
                <span className="card-glare" aria-hidden="true" />
                <span className="why-pillar-index" aria-hidden="true">
                  0{index + 1}
                </span>
                <span className="why-pillar-icon">
                  <pillar.icon size={20} aria-hidden="true" />
                </span>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="route reveal" data-progress>
          <p className="route-label">Ruten</p>
          <div className="route-line" aria-hidden="true">
            <span className="route-line-fill" />
            <span className="route-ship" />
          </div>
          <ol className="route-steps">
            {processSteps.map((step, index) => (
              <li
                key={step.label}
                className="route-step"
                style={{ "--step": index, "--steps": processSteps.length } as CSSProperties}
              >
                <span className="route-node">
                  <step.icon size={18} aria-hidden="true" />
                </span>
                <span className="route-step-number" aria-hidden="true">
                  0{index + 1}
                </span>
                <strong>{step.label}</strong>
                <span>{step.description}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="why-cta reveal" data-depth>
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

      <section id="booking" className="chapter booking-section px-page py-section">
        <div className="booking-copy reveal" data-depth>
          <ChapterMark number="04" label="Næste skridt" />
          <h2 className="chapter-title booking-title">
            <Lines lines={["Start din", <em key="b">rejse.</em>]} />
          </h2>
          <p>Lad os drøfte dine ønsker og muligheder om dit næste digitale skridt.</p>
          <ul className="calendar-facts">
            <li>15–30 minutter</li>
            <li>Ingen binding</li>
            <li>Dansk / Engelsk</li>
          </ul>
          <div className="booking-contact-meta">
            <span className="footer-label">Direkte kontakt</span>
            <a href="mailto:farda0@protonmail.com">farda0@protonmail.com</a>
          </div>
        </div>
        <div className="calendar-shell reveal reveal-late" data-depth>
          <div className="calendar-heading">
            <span className="calendar-heading-label">
              <i className="hero-rec" aria-hidden="true" /> Book tid
            </span>
            <span className="calendar-heading-status">Svar inden for 24 timer</span>
          </div>
          <div className="calendar-frame" data-loaded={calendarLoaded}>
            <div className="calendar-loading" aria-hidden={calendarLoaded}>
              <span />
              <p>Indlæser kalender…</p>
            </div>
            <iframe
              src="https://cal.com/farda?embed=true&theme=dark&name=&email="
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
