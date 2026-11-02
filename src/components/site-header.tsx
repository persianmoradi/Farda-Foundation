import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

export const SECTIONS = [
  { id: "services", label: "Services", chapter: "01" },
  { id: "cases", label: "Cases", chapter: "02" },
  { id: "about", label: "Hvorfor FARDA", chapter: "03" },
  { id: "booking", label: "Kontakt", chapter: "04" },
] as const;

type SiteHeaderProps = { isHome?: boolean };

function NavItem({
  section,
  isHome,
  className,
  onClick,
  children,
  current,
}: {
  section: string;
  isHome: boolean;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
  current?: boolean;
}) {
  if (isHome) {
    return (
      <a
        className={className}
        href={`#${section}`}
        onClick={onClick}
        aria-current={current ? "location" : undefined}
      >
        {children}
      </a>
    );
  }
  return (
    <Link className={className} to="/" hash={section} onClick={onClick}>
      {children}
    </Link>
  );
}

/** Tracks which chapter currently owns the middle of the viewport. */
function useActiveChapter(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const targets = ["top", ...SECTIONS.map((s) => s.id)]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id === "top" ? null : entry.target.id);
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [enabled]);

  return active;
}

export function SiteHeader({ isHome = false }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveChapter(isHome);
  const activeSection = SECTIONS.find((s) => s.id === active);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keep the drawer from being left open behind a resize to desktop.
  useEffect(() => {
    if (!menuOpen) return;
    const desktop = window.matchMedia("(min-width: 801px)");
    const close = () => setMenuOpen(false);
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    desktop.addEventListener("change", close);
    window.addEventListener("keydown", onKey);
    return () => {
      desktop.removeEventListener("change", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const wordmark = (
    <>
      FARDA<span className="text-primary">.</span>
    </>
  );

  return (
    <>
      <header className="site-header" data-scrolled={scrolled} data-menu-open={menuOpen}>
        <span className="scroll-progress" aria-hidden="true" />
        <div className="nav-shell">
          {isHome ? (
            <a href="#top" className="wordmark" aria-label="FARDA forside">
              {wordmark}
            </a>
          ) : (
            <Link to="/" className="wordmark" aria-label="FARDA forside">
              {wordmark}
            </Link>
          )}

          <p className="nav-chapter" aria-hidden="true">
            <span className="nav-chapter-dot" />
            <span key={active ?? "top"} className="nav-chapter-text">
              {isHome
                ? activeSection
                  ? `Kapitel ${activeSection.chapter} — ${activeSection.label}`
                  : "Kapitel 00 — Afgang"
                : "Destination"}
            </span>
          </p>

          <nav className="hero-nav" aria-label="Primær navigation">
            {SECTIONS.map((s) => (
              <NavItem
                key={s.id}
                section={s.id}
                isHome={isHome}
                className="nav-link"
                current={active === s.id}
              >
                {s.label}
              </NavItem>
            ))}
          </nav>
          <Button
            variant="icon"
            size="icon"
            className="mobile-menu-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Luk menu" : "Åbn menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </Button>
        </div>
        <nav
          id="mobile-navigation"
          className="mobile-navigation"
          data-open={menuOpen}
          aria-label="Mobil navigation"
          inert={!menuOpen}
        >
          {SECTIONS.map((s, index) => (
            <NavItem
              key={s.id}
              section={s.id}
              isHome={isHome}
              onClick={() => setMenuOpen(false)}
              className="mobile-nav-link"
            >
              <span className="mobile-nav-index" style={{ "--i": index } as CSSProperties}>
                {s.chapter}
              </span>
              <span className="mobile-nav-label" style={{ "--i": index } as CSSProperties}>
                {s.label}
              </span>
            </NavItem>
          ))}
        </nav>
      </header>

      {isHome && (
        <nav className="chapter-rail" aria-label="Kapitler">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="chapter-rail-item"
              data-active={active === s.id}
              aria-current={active === s.id ? "location" : undefined}
            >
              <span className="chapter-rail-label">{s.label}</span>
              <span className="chapter-rail-number">{s.chapter}</span>
            </a>
          ))}
        </nav>
      )}
    </>
  );
}
