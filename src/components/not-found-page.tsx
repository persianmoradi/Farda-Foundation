import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { useJourney } from "@/hooks/use-journey";

/** Lost in the night — the sky from the root stage glows behind it. */
export function NotFoundPage() {
  useJourney();

  return (
    <main id="main-content" className="notfound-page">
      <meta name="robots" content="noindex" />
      <div className="notfound-content">
        <p className="notfound-signal">
          <i className="hero-rec" aria-hidden="true" /> Signal tabt
        </p>
        <h1 className="notfound-code">
          4<span>0</span>4
        </h1>
        <p className="notfound-message">
          Du er drevet ud af kurs. Siden findes ikke, eller er blevet flyttet.
        </p>
        <Link to="/" className="farda-button notfound-home">
          <ArrowLeft size={17} />
          Tilbage til forsiden
        </Link>
      </div>
      <p className="notfound-coords" aria-hidden="true">
        ??°??′N · ??°??′E
      </p>
    </main>
  );
}
