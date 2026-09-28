import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

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
          {isHome ? (
            <a className="wordmark" href="#top">
              FARDA<span className="text-primary">.</span>
            </a>
          ) : (
            <Link className="wordmark" to="/">
              FARDA<span className="text-primary">.</span>
            </Link>
          )}
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
      <div className="footer-bottom reveal reveal-late">
        <span>© 2026 FARDA Studio</span>
        <span>Built for tomorrow</span>
        {isHome ? (
          <a href="#top">
            Til toppen <ArrowRight size={14} />
          </a>
        ) : (
          <Link to="/">
            Til toppen <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </footer>
  );
}
