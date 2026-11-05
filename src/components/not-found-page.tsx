import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

/** An empty plot on the blueprint: the world behind it rests on the plan. */
export function NotFoundPage() {
  return (
    <main id="main-content" className="notfound">
      <meta name="robots" content="noindex" />
      <div className="wrap notfound-inner panel">
        <p className="mono">Fejl 404</p>
        <h1 className="notfound-title">Siden er ikke bygget endnu</h1>
        <p className="section-lead">Siden findes ikke, eller den er blevet flyttet.</p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={17} aria-hidden="true" /> Gå til forsiden
        </Link>
      </div>
    </main>
  );
}
