import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

function SectionLink({
  section,
  isHome,
  children,
}: {
  section: string;
  isHome: boolean;
  children: ReactNode;
}) {
  if (isHome) {
    return (
      <a className="link" href={`#${section}`}>
        {children}
      </a>
    );
  }
  return (
    <Link className="link" to="/" hash={section}>
      {children}
    </Link>
  );
}

export function SiteFooter({ isHome = false }: { isHome?: boolean }) {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-row">
          <p className="footer-brand">Websites og webapps, designet og kodet i København.</p>
          <div className="footer-col">
            <span className="mono">Kontakt</span>
            <a className="link" href="mailto:farda0@protonmail.com">
              farda0@protonmail.com
            </a>
          </div>
          <div className="footer-col">
            <span className="mono">Siden</span>
            <SectionLink section="services" isHome={isHome}>
              Priser
            </SectionLink>
            <SectionLink section="cases" isHome={isHome}>
              Cases
            </SectionLink>
            <SectionLink section="about" isHome={isHome}>
              Om FARDA
            </SectionLink>
          </div>
        </div>
        <p className="footer-mark" aria-hidden="true">
          <span>FARDA</span>
          <span className="farsi" lang="fa">
            فردا
          </span>
        </p>
        <div className="footer-bottom">
          <span>© 2026 FARDA</span>
          <span>
            <span className="farsi" lang="fa">
              فردا
            </span>{" "}
            = i morgen
          </span>
        </div>
      </div>
    </footer>
  );
}
