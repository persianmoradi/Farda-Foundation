import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check, ExternalLink, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";

import aboutPortrait from "@/assets/persian-moradi.jpg.asset.json";
import caseAiPlatform from "@/assets/case-ai-platform.jpg.asset.json";
import caseSpkStotte from "@/assets/case-spkstotte.jpg.asset.json";
import heroAnimationAsset from "@/assets/hero-animation.mp4.asset.json";
import heroAnimationWebmAsset from "@/assets/hero-animation.webm.asset.json";
import heroPoster from "@/assets/hero-poster.jpg";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FARDA — Digitalt studio i København" },
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
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const packages = [
  {
    number: "01",
    title: "FARDA Essential",
    price: "Fra 3.500 kr.",
    description:
      "For virksomheder, der ønsker en lynhurtig, moderne og fuldt professionel digital tilstedeværelse.",
    features: [
      "3–4 sider",
      "Responsivt UI-design",
      "Grundlæggende SEO",
      "Performance-optimering",
      "Favicon",
    ],
    featured: false,
  },
  {
    number: "02",
    title: "FARDA Advanced",
    price: "Fra 8.000 kr.",
    description:
      "Kompleks digital løsning med skræddersyet UI/UX, interaktivitet og udvidet funktionalitet.",
    features: [
      "Alt fra Essential",
      "Udvidet sidetal",
      "Custom animationer",
      "Udvidet SEO",
      "API / Maps-integrationer",
      "Cookie / privacy-opsætning",
    ],
    featured: true,
  },
];

const cases = [
  {
    id: "saas",
    number: "01",
    title: "Modern SaaS Platform",
    category: "Product design · Platform",
    description:
      "Et fokuseret digitalt produkt med tydelig onboarding, rolig datavisning og et system, der kan vokse.",
    detail:
      "En placeholder for FARDA's næste produktcase: en skalerbar platform, hvor komplekse workflows bliver gjort menneskelige.",
    accent: "case-preview-blue",
    image: caseAiPlatform.url,
  },
  {
    id: "commerce",
    number: "02",
    title: "E-commerce Architecture",
    category: "Strategy · Commerce",
    description:
      "En fleksibel commerce-oplevelse, hvor brand, performance og konvertering arbejder i samme retning.",
    detail:
      "En placeholder for en ny commerce-case med en fleksibel arkitektur, præcis content direction og stærke købssignaler.",
    accent: "case-preview-orange",
    image: caseSpkStotte.url,
  },
] as const;

function Index() {
  const heroRef = useRef<HTMLElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [calendarLoaded, setCalendarLoaded] = useState(false);
  const [selectedCase, setSelectedCase] = useState<(typeof cases)[number] | null>(null);

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

  useEffect(() => {
    if (!selectedCase) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedCase(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedCase]);

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
    window.history.pushState(null, "", hash);
  };

  return (
    <main id="main-content" className="site-shell" onClick={handleAnchorClick}>
      <header className="site-header hero-enter hero-enter-header">
        <div className="nav-shell glass-dark">
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
              Om FARDA
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
            Om FARDA
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
            poster={heroPoster}
            width={1920}
            height={1080}
          >
            <source src={heroAnimationAsset.url} type="video/mp4" />
            <source src={heroAnimationWebmAsset.url} type="video/webm" />
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
          <div className="hero-support-panel glass-dark hero-enter hero-enter-bottom">
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
              className={`package-card glass-${item.featured ? "dark" : "light"} ${item.featured ? "package-card-featured" : ""} reveal reveal-card`}
            >
              <div className="package-top">
                <span className="package-number">{item.number} — FARDA package</span>
                <span className="package-status">
                  {item.featured ? "Mest valgt" : "Fast foundation"}
                </span>
              </div>
              <div className="package-visual" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <div className="package-content">
                <h3>{item.title}</h3>
                <p className="package-price">{item.price}</p>
                <p className="package-description">{item.description}</p>
              </div>
              <ul className="feature-list">
                {item.features.map((feature) => (
                  <li key={feature}>
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
            <p>
              To nye case retninger i udvikling — bygget med strategi, form og funktion i samme
              system.
            </p>
          </div>
          <div className="case-grid">
            {cases.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`case-card glass-dark reveal reveal-card ${item.accent}`}
                onClick={() => setSelectedCase(item)}
                aria-haspopup="dialog"
              >
                <span className="case-card-top">
                  <span>FARDA selected work</span>
                  <span>{item.number}</span>
                </span>
                <span className="case-preview" aria-hidden="true">
                  <img src={item.image} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="case-card-content glass-dark">
                  <span className="case-meta">{item.category}</span>
                  <span className="case-card-title">
                    <strong>{item.title}</strong>
                    <span className="case-action">
                      <ArrowRight size={19} />
                    </span>
                  </span>
                  <span className="case-card-description">{item.description}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="case-footer reveal" aria-hidden="true">
            <span>FARDA Selected work</span>
            <i />
            <span>2026</span>
          </div>
        </div>
      </section>

      <section id="about" className="section-light px-page py-section">
        <div className="section-label reveal">
          <span>Om FARDA</span>
        </div>
        <div className="about-editorial">
          <figure className="about-portrait reveal">
            <img
              src={aboutPortrait.url}
              alt="Persian Moradi, founder of FARDA"
              width={1024}
              height={1280}
              loading="lazy"
              decoding="async"
            />
          </figure>
          <div className="about-story reveal reveal-late">
            <span className="about-eyebrow">BAG FARDA</span>
            <h2>
              We don't just build for today.
              <br />
              We build for <span className="text-primary">tomorrow</span>.
            </h2>
            <div className="about-body">
              <p>
                Navnet er inspireret af det persiske ord <em>Farda</em>, som betyder "i morgen". Vi
                valgte det, fordi vi ikke bare vil bygge virksomhedernes digitale tilstedeværelse i
                dag — vi vil bygge det, de skal bruge i morgen.
              </p>
              <p>
                Det handler om at lægge et stærkt digitalt fundament, som virksomheden kan vokse
                videre med. Derfor bygger FARDA i dag med morgendagen i tankerne.
              </p>
            </div>
            <div className="about-cta">
              <Button asChild variant="primary" size="lg">
                <a href="#booking">
                  <span>Book en samtale</span>
                  <ArrowRight size={17} />
                </a>
              </Button>
              <div className="about-signature">
                <strong>Persian Moradi</strong>
                <span>Founder & Builder</span>
              </div>
            </div>
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
        <div className="calendar-shell glass-light reveal reveal-late">
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

      <footer className="footer px-page">
        <div className="footer-top reveal">
          <div>
            <h2 className="footer-title">
              BUILD <span>TOMORROW</span>
            </h2>
          </div>
          <div className="footer-cta">
            <p>Har du en idé, der fortjener en skarpere digital retning?</p>
            <a className="footer-cta-link" href="#booking">
              Book en samtale <ArrowRight size={17} />
            </a>
          </div>
        </div>
        <div className="footer-row reveal reveal-late">
          <div className="footer-brand">
            <a className="wordmark" href="#top">
              FARDA<span className="text-primary">.</span>
            </a>
            <p>Digitalt studio for virksomheder med noget på spil.</p>
          </div>
          <div className="footer-contact">
            <span className="footer-label">Kontakt</span>
            <a href="mailto:farda0@protonmail.com">farda0@protonmail.com</a>
            <span>CVR: XXXXXXXX</span>
          </div>
          <div className="footer-links">
            <span className="footer-label">Udforsk</span>
            <a href="#services">Services</a>
            <a href="#cases">Cases</a>
            <a href="#about">Om FARDA</a>
          </div>
        </div>
        <div className="footer-bottom reveal reveal-late">
          <span>© 2026 FARDA Studio</span>
          <span>Built for tomorrow</span>
          <a href="#top">
            Til toppen <ArrowRight size={14} />
          </a>
        </div>
      </footer>

      {selectedCase ? (
        <div
          className="case-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedCase(null);
          }}
        >
          <section
            className="case-modal glass-dark"
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-modal-title"
          >
            <button
              type="button"
              className="case-modal-close"
              onClick={() => setSelectedCase(null)}
              aria-label="Luk case preview"
            >
              <X size={20} />
            </button>
            <div className={`case-modal-preview ${selectedCase.accent}`}>
              <img src={selectedCase.image} alt="" decoding="async" />
              <span>{selectedCase.number}</span>
            </div>
            <div className="case-modal-content">
              <span className="case-meta">{selectedCase.category}</span>
              <h2 id="case-modal-title">{selectedCase.title}</h2>
              <p>{selectedCase.detail}</p>
              <a href="#booking" onClick={() => setSelectedCase(null)}>
                Start en samtale <ArrowRight size={17} />
              </a>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
