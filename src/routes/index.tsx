import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, ExternalLink, Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";

import aboutPortrait from "@/assets/persian-moradi.jpg.asset.json";
import heroAnimationAsset from "@/assets/hero-animation.mp4.asset.json";
import heroAnimationWebmAsset from "@/assets/hero-animation.webm.asset.json";
import heroPoster from "@/assets/hero-poster.jpg";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { caseStudies } from "@/lib/cases";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FARDA — Digitalt studio i København" },
      { name: "description", content: "FARDA bygger hurtige, præcise digitale oplevelser for ambitiøse virksomheder." },
      { property: "og:title", content: "FARDA — Build tomorrow" },
      { property: "og:description", content: "Et digitalt studio for virksomheder, der vil stå skarpere i morgen." },
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
    description: "For virksomheder, der ønsker en lynhurtig, moderne og fuldt professionel digital tilstedeværelse.",
    features: ["3–4 sider", "Responsivt UI-design", "Grundlæggende SEO", "Performance-optimering", "Favicon", "\n"],
    featured: false,
  },
  {
    number: "02",
    title: "FARDA Advanced",
    price: "Fra 8.000 kr.",
    description: "Kompleks digital løsning med skræddersyet UI/UX, interaktivitet og udvidet funktionalitet.",
    features: ["Alt fra Essential", "Udvidet sidetal", "Custom animationer", "Udvidet SEO", "API / Maps-integrationer", "Cookie / privacy-opsætning"],
    featured: true,
  },
];

const CASE_INTERVAL_MS = 5200;
const CASE_COUNT = caseStudies.length;

const relativeOffset = (index: number, active: number) => {
  let offset = index - active;
  while (offset > CASE_COUNT / 2) offset -= CASE_COUNT;
  while (offset < -CASE_COUNT / 2) offset += CASE_COUNT;
  return offset;
};

function Index() {
  const heroRef = useRef<HTMLElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeCase, setActiveCase] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [calendarLoaded, setCalendarLoaded] = useState(false);

  const [isWideViewport, setIsWideViewport] = useState(false);

  const [hoveredCase, setHoveredCase] = useState<number | null>(null);
  const [expandingCase, setExpandingCase] = useState<string | null>(null);
  const navigate = useNavigate();


  useScrollReveal();

  useEffect(() => {
    const hero = heroRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!hero || reducedMotion) return;

    let frame = 0;
    let heroVisible = true;
    const updateHero = () => {
      frame = 0;
      const progress = Math.min(window.scrollY / Math.max(hero.offsetHeight, 1), 1);
      hero.style.setProperty("--hero-scroll", progress.toFixed(3));
    };
    const onScroll = () => {
      if (heroVisible && !frame) frame = window.requestAnimationFrame(updateHero);
    };
    const observer = new IntersectionObserver(([entry]) => {
      heroVisible = Boolean(entry?.isIntersecting);
      if (heroVisible) updateHero();
    }, { threshold: 0 });
    updateHero();
    observer.observe(hero);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    const video = heroVideoRef.current;
    if (!hero || !video) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePlayback = (isVisible: boolean) => {
      if (reducedMotion.matches || !isVisible || document.hidden) {
        video.pause();
        return;
      }
      void video.play().catch(() => undefined);
    };
    const observer = new IntersectionObserver(([entry]) => updatePlayback(Boolean(entry?.isIntersecting)), { threshold: 0.05 });
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
    const query = window.matchMedia("(min-width: 1180px) and (min-height: 620px) and (hover: hover) and (pointer: fine)");
    const update = () => setIsWideViewport(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const openCase = useCallback((slug: string) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      void navigate({ to: "/cases/$slug", params: { slug } });
      return;
    }
    setExpandingCase(slug);
    window.setTimeout(() => void navigate({ to: "/cases/$slug", params: { slug } }), 460);
  }, [navigate]);



  const goToCase = useCallback((index: number) => {
    setActiveCase(((index % CASE_COUNT) + CASE_COUNT) % CASE_COUNT);
  }, []);

  const moveCarousel = useCallback((direction: -1 | 1) => {
    setActiveCase((current) => (current + direction + CASE_COUNT) % CASE_COUNT);
  }, []);

  const showPreviousCase = () => moveCarousel(-1);
  const showNextCase = () => moveCarousel(1);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || isWideViewport || document.hidden) return;
    const interval = window.setInterval(() => moveCarousel(1), CASE_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [activeCase, isWideViewport, moveCarousel]);




  const handleAnchorClick = (event: ReactMouseEvent<HTMLElement>) => {
    const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!anchor || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const hash = anchor.getAttribute("href");
    if (!hash || hash === "#") return;
    const target = document.querySelector<HTMLElement>(hash);
    if (!target) return;
    event.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    window.history.pushState(null, "", hash);
  };

  return (
    <main id="main-content" className="overflow-x-clip" onClick={handleAnchorClick}>
      <header className="site-header hero-enter hero-enter-header">
        <a href="#top" className="wordmark" aria-label="FARDA forside">FARDA<span className="text-primary">.</span></a>
        <nav className="hero-nav flex items-center" aria-label="Primær navigation">
          <a className="nav-link" href="#services">Services</a>
          <a className="nav-link" href="#cases">Cases</a>
          <a className="nav-link" href="#about">Om FARDA</a>
        </nav>
        <Button asChild variant="outline" className="header-cta"><a href="#booking">Book samtale <ArrowRight size={15} /></a></Button>
        <Button variant="icon" size="icon" className="mobile-menu-toggle" onClick={() => setMobileMenuOpen((open) => !open)} aria-label={mobileMenuOpen ? "Luk menu" : "Åbn menu"} aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation">
          {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
        </Button>
        <nav id="mobile-navigation" className="mobile-navigation" data-open={mobileMenuOpen} aria-label="Mobil navigation">
          <a href="#services" onClick={() => setMobileMenuOpen(false)}>Services</a>
          <a href="#cases" onClick={() => setMobileMenuOpen(false)}>Cases</a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>Om FARDA</a>
          <a href="#booking" onClick={() => setMobileMenuOpen(false)}>Book samtale <ArrowRight size={16} /></a>
        </nav>
      </header>

      <section id="top" className="hero-section" ref={heroRef}>
        <div className="hero-media" aria-hidden="true">
          <video ref={heroVideoRef} className="hero-video" autoPlay loop muted playsInline preload="auto" poster={heroPoster} width={1920} height={1080}>
            <source src={heroAnimationAsset.url} type="video/mp4" />
            <source src={heroAnimationWebmAsset.url} type="video/webm" />
          </video>
        </div>
        <div className="hero-scrim" />
        <div className="hero-title-wrap" aria-label="FARDA — Build tomorrow">
          <div className="hero-axis hero-enter hero-enter-meta" aria-hidden="true"><span /></div>
          <p className="hero-kicker hero-enter hero-enter-kicker">Digitalt studio · København</p>
          <h1 className="hero-title hero-enter hero-enter-title">BUILD<br /><span>TOMORROW</span></h1>
          <div className="hero-bottom hero-enter hero-enter-bottom">
            <p>Vi skaber distinkte digitale oplevelser for virksomheder med noget på spil.</p>
            <Button asChild variant="primary" size="lg" className="hero-enter-button">
              <a href="#booking"><span>Start et projekt</span><span className="hero-cta-arrow"><ArrowRight size={18} /></span></a>
            </Button>
          </div>
        </div>
        <a href="#services" className="scroll-cue hero-enter hero-enter-cue" aria-label="Se vores services"><span>Scroll</span><i aria-hidden="true" /></a>
        <p className="hero-edition hero-enter hero-enter-cue">FARDA · 2026</p>
      </section>

      <section id="services" className="section-light px-page py-section">
        <div className="section-label reveal"><span>01</span><span>Services</span></div>
        <div className="services-intro reveal">
          <h2>Fra første tanke<br />til færdigt format.</h2>
          <p>Strategi, design og udvikling samlet i ét fokuseret forløb.</p>
        </div>
        <div className="package-grid">
          {packages.map((item) => (
            <article key={item.title} className={item.featured ? "package-card package-card-featured reveal reveal-card" : "package-card reveal reveal-card"}>
              <div className="flex items-start justify-between gap-5">
                <span className="package-number">{item.number}</span>
                {item.featured && <span className="recommended">Mest valgt</span>}
              </div>
              <div>
                <h3>{item.title}</h3>
                <p className="package-price">{item.price}</p>
                <p className="package-description">{item.description}</p>
              </div>
              <ul className="feature-list">
                {item.features.map((feature) => <li key={feature}><Check size={16} />{feature}</li>)}
              </ul>
              <Button asChild variant={item.featured ? "primary" : "outline"} className="w-full justify-between">
                <a href="#booking">Vælg {item.title.replace("FARDA ", "")}<ArrowRight size={17} /></a>
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section id="cases" className="section-dark py-section">
        <div className="px-page cases-inner">
          <div className="section-label section-label-dark reveal"><span>02</span><span>Udvalgte cases</span></div>
          <div className="cases-heading reveal">
            <h2>Arbejde med<br /><span>en klar retning.</span></h2>
            <p>Udvalgte digitale oplevelser, hvor strategi, form og funktion arbejder i samme retning.</p>
          </div>

          {isWideViewport ? (
          <div className="case-fan reveal" data-hovered={hoveredCase !== null ? "true" : undefined} onPointerLeave={() => setHoveredCase(null)}>
            {caseStudies.map((item, index) => {
              const state = expandingCase === item.slug
                ? "is-expanding"
                : hoveredCase === index
                  ? "is-centered"
                  : hoveredCase !== null
                    ? "is-receded"
                    : "";
              return (
                <article
                  key={item.slug}
                  className={`case-flag ${state}`}
                  style={{ "--flag-index": index, "--flag-offset": index - (CASE_COUNT - 1) / 2, "--flag-delay": `${index * 0.9}s` } as CSSProperties}
                  onPointerEnter={() => setHoveredCase(index)}
                  onFocus={() => setHoveredCase(index)}
                >
                  <Link
                    to="/cases/$slug"
                    params={{ slug: item.slug }}
                    className="case-flag-link"
                    onClick={(event) => {
                      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
                      event.preventDefault();
                      openCase(item.slug);
                    }}
                  >
                    <img src={item.image} alt={`${item.name} digitalt designkoncept`} width={1536} height={1024} loading="lazy" decoding="async" />
                    <div className="case-shade" />
                    <span className="case-slide-number">0{index + 1}</span>
                    <div className="case-flag-content">
                      <div className="case-meta"><span>{item.category}</span><span>{item.year}</span></div>
                      <div className="case-flag-title"><h3>{item.name}</h3><span className="case-action"><ArrowRight size={19} /></span></div>
                      <p>{item.description}</p>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
          ) : (
          <div
            className="case-carousel reveal"
            aria-roledescription="carousel"
            aria-label="Udvalgte cases"
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") showPreviousCase();
              if (event.key === "ArrowRight") showNextCase();
            }}
          >
            <div
              className="case-carousel-stage"
              ref={carouselRef}
            >
              {caseStudies.map((item, index) => {
                const position = relativeOffset(index, activeCase);
                const positionClass = position === 0
                  ? "is-active"
                  : position === -1
                    ? "is-previous"
                    : position === 1
                      ? "is-next"
                      : "is-distant";
                const media = (
                  <>
                    <img src={item.image} alt={`${item.name} digitalt designkoncept`} width={1536} height={1024} loading="lazy" decoding="async" />
                    <div className="case-shade" />
                    <span className="case-slide-number">0{index + 1}</span>
                    <div className="case-slide-content">
                      <div className="case-meta"><span>{item.category}</span><span>{item.year}</span></div>
                      <div className="case-slide-title"><h3>{item.name}</h3><span className="case-action"><ArrowRight size={19} /></span></div>
                      <p>{item.description}</p>
                    </div>
                  </>
                );
                return (
                  <article
                    className={`case-slide ${positionClass}`}
                    data-case-index={index}
                    key={item.slug}
                    aria-label={`${index + 1} af ${CASE_COUNT}`}
                    aria-hidden={Math.abs(position) > 1 ? "true" : undefined}
                    style={{ "--slide-position": position } as CSSProperties}
                  >
                    {position === 0 ? (
                      <Link to="/cases/$slug" params={{ slug: item.slug }} className="case-slide-link">{media}</Link>
                    ) : Math.abs(position) === 1 ? (
                      <button type="button" className="case-slide-link case-slide-focus" onClick={() => goToCase(index)} tabIndex={-1} aria-label={`Vis ${item.name}`}>{media}</button>
                    ) : (
                      <div className="case-slide-link case-slide-static">{media}</div>
                    )}
                  </article>
                );
              })}
            </div>

            <div className="case-carousel-controls">
              <div className="case-carousel-arrows">
                <Button variant="icon" size="icon" className="case-carousel-arrow" onClick={showPreviousCase} aria-label="Forrige case"><ArrowLeft size={18} /></Button>

                <Button variant="icon" size="icon" className="case-carousel-arrow" onClick={showNextCase} aria-label="Næste case"><ArrowRight size={18} /></Button>
              </div>
              <span className="case-carousel-count">0{activeCase + 1} / 0{caseStudies.length}</span>
              <p className="sr-only" aria-live="polite">Viser case {activeCase + 1}: {caseStudies[activeCase]?.name}</p>
            </div>
          </div>
          )}

          <div className="case-footer reveal reveal-late" aria-hidden="true">
            <span>FARDA Selected work</span><i /><span>2025—2026</span>
          </div>
        </div>
      </section>

      <section id="about" className="section-light px-page py-section">
        <div className="section-label reveal"><span>03</span><span>Om FARDA</span></div>
        <div className="about-editorial">
          <figure className="about-portrait reveal">
            <img src={aboutPortrait.url} alt="Persian Moradi, founder of FARDA" width={1024} height={1280} loading="lazy" decoding="async" />
          </figure>
          <div className="about-story reveal reveal-late">
            <span className="about-eyebrow">BAG FARDA</span>
            <h2>We don't just build for today.<br />We build for <span className="text-primary">tomorrow</span>.</h2>
            <div className="about-body">
              <p>Navnet er inspireret af det persiske ord <em>Farda</em>, som betyder "i morgen". Vi valgte det, fordi vi ikke bare vil bygge virksomhedernes digitale tilstedeværelse i dag — vi vil bygge det, de skal bruge i morgen.</p>
              <p>Det handler ikke kun om at skabe et digitalt produkt til en virksomhed her og nu, men om at lægge et stærkt digitalt fundament, som virksomheden kan vokse videre med. Derfor bygger FARDA i dag med morgendagen i tankerne.</p>
            </div>
            <div className="about-cta">
              <Button asChild variant="primary" size="lg">
                <a href="#booking">Book en samtale <ArrowRight size={17} /></a>
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
          <div className="section-label section-label-dark"><span>04</span><span>Næste skridt</span></div>
          <h2>Start din rejse.</h2>
          <p>Lad os drøfte dine ønsker og muligheder om dit næste digitale skridt.</p>
          <ul className="calendar-facts calendar-facts-dark">
            <li>15–30 minutter</li>
            <li>Ingen binding</li>
            <li>Dansk / Engelsk</li>
          </ul>
        </div>
        <div className="calendar-shell is-open reveal reveal-late">
          <div className="calendar-frame" data-loaded={calendarLoaded}>
            <div className="calendar-loading" aria-hidden={calendarLoaded}><span /><p>Indlæser kalender…</p></div>
            <iframe
              src="https://cal.com/farda?embed=true&theme=light&name=&email="
              title="Book en samtale med FARDA"
              loading="lazy"
              onLoad={() => setCalendarLoaded(true)}
            />
          </div>
          <a className="calendar-fallback" href="https://cal.com/farda?name=&email=" target="_blank" rel="noreferrer">Åbn i nyt vindue <ExternalLink size={15} /></a>
        </div>



      </section>

      <footer className="footer px-page">
        <p className="footer-title reveal">BUILD TOMORROW</p>
        <div className="footer-row reveal reveal-late">
          <a className="wordmark" href="#top">FARDA<span className="text-primary">.</span></a>
          <div className="footer-contact"><span>CVR: XXXXXXXX</span><a href="mailto:farda0@protonmail.com">farda0@protonmail.com</a></div>
          <div className="footer-links"><a href="#privacy">Privatliv</a><a href="#terms">Vilkår</a><span>© 2026</span></div>
        </div>
      </footer>
    </main>
  );
}
