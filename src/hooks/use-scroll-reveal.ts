import { useEffect } from "react";

export function useScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) return;

    root.classList.add("motion-ready");

    const show = (element: HTMLElement) => element.classList.add("is-visible");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          show(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -10%" },
    );

    const register = (element: HTMLElement) => {
      if (element.dataset["revealBound"] === "true") return;
      element.dataset["revealBound"] = "true";
      // Anything already in or above the viewport becomes visible immediately.
      if (element.getBoundingClientRect().top < window.innerHeight) {
        show(element);
        return;
      }
      observer.observe(element);
    };

    const scan = () => {
      document.querySelectorAll<HTMLElement>(".reveal").forEach(register);
    };

    scan();

    // Reveal elements can be mounted later (viewport-dependent layouts, lazy sections).
    const mutationObserver = new MutationObserver(() => scan());
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    // Safety net: never leave content permanently transparent.
    const safety = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)").forEach((element) => {
        if (element.getBoundingClientRect().top < window.innerHeight * 1.5) show(element);
      });
    }, 1600);

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      window.clearTimeout(safety);
      root.classList.remove("motion-ready");
    };
  }, []);
}
