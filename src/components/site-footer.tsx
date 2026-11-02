import { Link } from "@tanstack/react-router";
import { ArrowUp } from "lucide-react";

type SiteFooterProps = {
  isHome?: boolean;
};

function SectionLink({
  section,
  isHome,
  children,
}: {
  section: string;
  isHome: boolean;
  children: React.ReactNode;
}) {
  if (isHome) {
    return <a href={`#${section}`}>{children}</a>;
  }
  return (
    <Link to="/" hash={section}>
      {children}
    </Link>
  );
}

export function SiteFooter({ isHome = false }: SiteFooterProps) {
  return (
    <footer className="footer px-page">
      <div className="footer-row reveal reveal-late">
        <div className="footer-brand">
          <p className="footer-label">Rejsen fortsætter</p>
          <p>Digitalt studio for virksomheder med noget på spil.</p>
        </div>
        <div className="footer-contact">
          <span className="footer-label">Kontakt</span>
          <a href="mailto:farda0@protonmail.com">farda0@protonmail.com</a>
          <span>CVR: XXXXXXXX</span>
        </div>
        <div className="footer-links">
          <span className="footer-label">Udforsk</span>
          <SectionLink section="services" isHome={isHome}>
            Services
          </SectionLink>
          <SectionLink section="cases" isHome={isHome}>
            Cases
          </SectionLink>
          <SectionLink section="about" isHome={isHome}>
            Om FARDA
          </SectionLink>
        </div>
      </div>

      {isHome ? (
        <a className="footer-wordmark" href="#top" aria-label="FARDA — til toppen">
          FARDA<span className="text-primary">.</span>
        </a>
      ) : (
        <Link className="footer-wordmark" to="/" aria-label="FARDA forside">
          FARDA<span className="text-primary">.</span>
        </Link>
      )}

      <div className="footer-bottom">
        <span>© 2026 FARDA Studio</span>
        <span>Built for tomorrow</span>
        {isHome ? (
          <a href="#top">
            Til toppen <ArrowUp size={14} />
          </a>
        ) : (
          <Link to="/">
            Til forsiden <ArrowUp size={14} />
          </Link>
        )}
      </div>
    </footer>
  );
}
