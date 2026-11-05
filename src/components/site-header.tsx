import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

const SECTIONS = [
  { id: "services", label: "Priser" },
  { id: "cases", label: "Cases" },
  { id: "about", label: "Om FARDA" },
] as const;

function NavItem({
  section,
  isHome,
  className,
  onClick,
  children,
  current,
  style,
}: {
  section: string;
  isHome: boolean;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
  current?: boolean;
  style?: CSSProperties;
}) {
  if (isHome) {
    return (
      <a
        className={className}
        href={`#${section}`}
        onClick={onClick}
        style={style}
        aria-current={current ? "location" : undefined}
      >
        {children}
      </a>
    );
  }
  return (
    <Link className={className} to="/" hash={section} onClick={onClick} style={style}>
      {children}
    </Link>
  );
}

/** Tracks which section currently owns the middle of the viewport. */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const targets = ["top", ...SECTIONS.map((s) => s.id), "kontakt"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [enabled]);
  return active;
}

export function SiteHeader({ isHome = false }: { isHome?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection(isHome);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const desktop = window.matchMedia("(min-width: 801px)");
    const close = () => setMenuOpen(false);
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    desktop.addEventListener("change", close);
    window.addEventListener("keydown", onKey);
    document.documentElement.dataset["menu"] = "open";
    return () => {
      desktop.removeEventListener("change", close);
      window.removeEventListener("keydown", onKey);
      delete document.documentElement.dataset["menu"];
    };
  }, [menuOpen]);

  const wordmark = (
    <>
      <span className="wordmark-latin">FARDA</span>
      <span className="wordmark-farsi" lang="fa" aria-hidden="true">
        فردا
      </span>
    </>
  );

  return (
    <header className="site-header" data-scrolled={scrolled} data-menu-open={menuOpen}>
      <div className="wrap nav">
        {isHome ? (
          <a href="#top" className="wordmark" aria-label="FARDA forside">
            {wordmark}
          </a>
        ) : (
          <Link to="/" className="wordmark" aria-label="FARDA forside">
            {wordmark}
          </Link>
        )}

        <nav className="nav-links" aria-label="Primær navigation">
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

        <NavItem section="kontakt" isHome={isHome} className="btn btn-primary btn-sm nav-cta">
          Kontakt FARDA
        </NavItem>

        <button
          type="button"
          className="menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Luk menu" : "Åbn menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav
        id="mobile-navigation"
        className="mobile-nav"
        data-open={menuOpen}
        aria-label="Mobil navigation"
        inert={!menuOpen}
      >
        {[...SECTIONS, { id: "kontakt", label: "Kontakt FARDA" }].map((s, index) => (
          <NavItem
            key={s.id}
            section={s.id}
            isHome={isHome}
            onClick={() => setMenuOpen(false)}
            className="mobile-nav-link"
            style={{ "--i": index } as CSSProperties}
          >
            <span className="mono">0{index + 1}</span>
            {s.label}
          </NavItem>
        ))}
      </nav>
    </header>
  );
}
