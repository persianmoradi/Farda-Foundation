import { ArrowRight } from "lucide-react";

type SiteFooterProps = {
  isHome?: boolean;
};

function sectionHref(section: string, isHome: boolean) {
  return isHome ? `#${section}` : `/#${section}`;
}

export function SiteFooter({ isHome = false }: SiteFooterProps) {
  return (
    <footer className="footer px-page">
      <div className="footer-row reveal reveal-late">
        <div className="footer-brand">
          <a className="wordmark" href={isHome ? "#top" : "/"}>
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
          <a href={sectionHref("services", isHome)}>Services</a>
          <a href={sectionHref("cases", isHome)}>Cases</a>
          <a href={sectionHref("about", isHome)}>Om FARDA</a>
        </div>
      </div>
      <div className="footer-bottom reveal reveal-late">
        <span>© 2026 FARDA Studio</span>
        <span>Built for tomorrow</span>
        <a href={isHome ? "#top" : "/"}>
          Til toppen <ArrowRight size={14} />
        </a>
      </div>
    </footer>
  );
}
