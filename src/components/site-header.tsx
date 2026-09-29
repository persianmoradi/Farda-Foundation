import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

const SECTIONS = [
  { id: "services", label: "Services" },
  { id: "cases", label: "Cases" },
  { id: "about", label: "Hvorfor FARDA" },
  { id: "booking", label: "Kontakt" },
] as const;

type SiteHeaderProps = { isHome?: boolean };

function NavItem({
  section,
  isHome,
  className,
  onClick,
  children,
}: {
  section: string;
  isHome: boolean;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  if (isHome) {
    return (
      <a className={className} href={`#${section}`} onClick={onClick}>
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

export function SiteHeader({ isHome = false }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
    desktop.addEventListener("change", close);
    return () => desktop.removeEventListener("change", close);
  }, [menuOpen]);

  return (
    <header className="site-header" data-scrolled={scrolled} data-menu-open={menuOpen}>
      <span className="scroll-progress" aria-hidden="true" />
      <div className="nav-shell">
        {isHome ? (
          <a href="#top" className="wordmark" aria-label="FARDA forside">
            FARDA<span className="text-primary">.</span>
          </a>
        ) : (
          <Link to="/" className="wordmark" aria-label="FARDA forside">
            FARDA<span className="text-primary">.</span>
          </Link>
        )}
        <nav className="hero-nav" aria-label="Primær navigation">
          {SECTIONS.map((s) => (
            <NavItem key={s.id} section={s.id} isHome={isHome} className="nav-link">
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
      >
        {SECTIONS.map((s) => (
          <NavItem key={s.id} section={s.id} isHome={isHome} onClick={() => setMenuOpen(false)}>
            {s.label}
          </NavItem>
        ))}
      </nav>
    </header>
  );
}
