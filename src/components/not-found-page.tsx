import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import heroAnimation from "@/assets/hero-vid.mp4";

export function NotFoundPage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePlayback = () => {
      if (reducedMotion.matches) {
        video.pause();
      } else {
        void video.play().catch(() => undefined);
      }
    };

    updatePlayback();
    reducedMotion.addEventListener("change", updatePlayback);
    return () => reducedMotion.removeEventListener("change", updatePlayback);
  }, []);

  return (
    <div className="notfound-page">
      <meta name="robots" content="noindex" />
      <div className="notfound-media" aria-hidden="true">
        <video
          ref={videoRef}
          className="notfound-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={heroAnimation} type="video/mp4" />
        </video>
      </div>
      <div className="notfound-scrim" aria-hidden="true" />
      <div className="notfound-content">
        <div className="notfound-glass">
          <span className="notfound-glass-sheen" aria-hidden="true" />
          <span className="notfound-glass-blob notfound-glass-blob-a" aria-hidden="true" />
          <span className="notfound-glass-blob notfound-glass-blob-b" aria-hidden="true" />
          <p className="notfound-wordmark">FARDA</p>
          <p className="notfound-code">404</p>
          <p className="notfound-message">Siden findes ikke, eller er blevet flyttet.</p>
          <Link to="/" className="notfound-home">
            Tilbage til forsiden
          </Link>
        </div>
      </div>
    </div>
  );
}
