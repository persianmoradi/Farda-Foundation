import { createFileRoute, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Mail } from "lucide-react";
import { useEffect, useState, type CSSProperties, type FormEvent, type MouseEvent } from "react";

import pmPic from "@/assets/pm-pic.webp";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { cases } from "@/data/cases";
import { DK_PHONE, sendRequest } from "@/lib/send-request";
import { absoluteUrl } from "@/lib/seo";
import { scrollToTarget } from "@/lib/smooth-scroll";

const description =
  "FARDA er et AI-native konsulenthus, der bygger websites og webapps til virksomheder, der bygger til i morgen. Fra 5.000 kr. ekskl. moms, direkte med udvikleren, fra København.";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "FARDA",
  url: absoluteUrl("/"),
  description,
  founder: { "@type": "Person", name: "Persian Moradi" },
  areaServed: "DK",
  knowsLanguage: ["da", "en"],
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FARDA — AI-native konsulenthus for websites og webapps" },
      { name: "description", content: description },
      { property: "og:title", content: "FARDA — AI-native konsulenthus for websites og webapps" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/") },
      { name: "twitter:card", content: "summary" },
      { "script:ld+json": organizationJsonLd },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/") }],
  }),
  component: Index,
});

const packages = [
  {
    sheet: "A-01",
    title: "FARDA Essential",
    price: "5.000",
    description:
      "Til virksomheder, der skal have en professionel hjemmeside online hurtigt og uden besvær.",
    features: [
      "Op til 4 sider",
      "Moderne, responsivt design",
      "Kontaktformular direkte til din mail",
      "Grundlæggende SEO",
      "Hurtig og performance-optimeret",
      "2 rettelsesrunder",
    ],
    featured: false,
  },
  {
    sheet: "A-02",
    title: "FARDA Advanced",
    price: "8.000",
    description:
      "Til virksomheder, der vil skille sig ud med en interaktiv oplevelse, som kunderne husker.",
    features: [
      "Alt fra Essential",
      "Skræddersyet design og UX",
      "Op til 10 sider",
      "Interaktive 3D-elementer",
      "Scroll- og mikroanimationer",
      "Udvidet SEO og struktureret data",
      "Integrationer: API, kort, booking m.m.",
      "4 rettelsesrunder",
    ],
    featured: true,
  },
];

/** Essential vs Advanced, row by row, so the price difference is easy to see. */
const comparison: [string, string, string][] = [
  ["Sider", "Op til 4", "Op til 10"],
  [
    "Design",
    "Moderne og responsivt, bygget på gennemprøvede layouts",
    "Skræddersyet til din virksomhed med gennemtænkt art direction og UX",
  ],
  ["Animationer", "Rolige overgange", "Scroll- og mikroanimationer"],
  ["3D", "—", "Interaktive 3D-elementer"],
  ["SEO", "Grundlæggende", "Udvidet, inkl. struktureret data"],
  ["Integrationer", "Kontaktformular", "API, kort, booking m.m."],
  ["Rettelser", "2 runder", "4 runder"],
  ["Pris ekskl. moms", "5.000 kr.", "8.000 kr."],
];

const pillars = [
  {
    title: "Taler direkte med udvikleren",
    text: "Ingen account managers og ingen mellemled. Den, du taler med, er den, der bygger.",
  },
  {
    title: "Lancerer på uger",
    text: "En AI-native arbejdsgang fra idé til lancering — ikke måneder.",
  },
  {
    title: "Bygger kode, der kan vokse",
    text: "Et fundament din forretning kan bygge videre på, ikke en skabelon du vokser fra.",
  },
];

const steps = [
  { label: "Strategi", text: "Mål, målgruppe og de rigtige funktioner." },
  { label: "Design", text: "UI og UX skræddersyet til din forretning." },
  { label: "Udvikling", text: "Moderne kode bygget til performance." },
  { label: "Lancering", text: "Live, testet og klar til at skalere." },
];

function Eyebrow({ phase, label }: { phase: string; label: string }) {
  return (
    <p className="eyebrow">
      <span className="eyebrow-phase">{phase}</span>
      <span className="eyebrow-line" aria-hidden="true" />
      <span>{label}</span>
    </p>
  );
}

const EMAIL = "farda0@protonmail.com";

const contactSteps = [
  { title: "Skriv din vision", text: "En mail om din idé, dine mål og din tidsplan." },
  { title: "Svar inden for 24 timer", text: "Jeg vender tilbage og foreslår et tidspunkt." },
  {
    title: "Uforpligtende møde",
    text: "Du og jeg taler løsningen igennem. Du beslutter bagefter.",
  },
];

function RequestForm() {
  const [pkg, setPkg] = useState(packages[0]?.title ?? "");
  const [maintenance, setMaintenance] = useState(false);

  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    try {
      await sendRequest({
        data: {
          name: String(data.get("name") ?? ""),
          company: String(data.get("company") ?? ""),
          phone: String(data.get("phone") ?? ""),
          vision: String(data.get("vision") ?? ""),
          pkg,
          maintenance,
        },
      });
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form
      className="request panel"
      onSubmit={send}
      onFocus={() => window.dispatchEvent(new CustomEvent("farda:glow", { detail: true }))}
      onBlur={() => window.dispatchEvent(new CustomEvent("farda:glow", { detail: false }))}
    >
      <fieldset>
        <legend>Vælg pakke</legend>
        {packages.map((item) => (
          <label key={item.title}>
            <input
              type="radio"
              name="pkg"
              checked={pkg === item.title}
              onChange={() => setPkg(item.title)}
            />
            {item.title} · {item.price} kr.
          </label>
        ))}
      </fieldset>
      <label>
        <input
          type="checkbox"
          checked={maintenance}
          onChange={(e) => setMaintenance(e.target.checked)}
        />
        Tilføj vedligehold · 400 kr. / md.
      </label>
      <input
        name="name"
        required
        autoComplete="name"
        placeholder="Dit navn"
        aria-label="Dit navn"
      />
      <input
        name="company"
        required
        autoComplete="organization"
        placeholder="Virksomhedsnavn"
        aria-label="Virksomhedsnavn"
      />
      <input
        name="phone"
        type="tel"
        required
        autoComplete="tel"
        inputMode="tel"
        onInput={(e) => {
          const input = e.currentTarget;
          input.setCustomValidity(
            DK_PHONE.test(input.value.replace(/[\s-]/g, ""))
              ? ""
              : "Skriv et dansk telefonnummer, fx 22 33 44 55 eller +45 22 33 44 55",
          );
        }}
        placeholder="Telefonnummer (fx 22 33 44 55)"
        aria-label="Telefonnummer"
      />
      <textarea
        name="vision"
        required
        rows={5}
        placeholder="Skriv din vision: hvad skal løsningen kunne, og hvornår skal den være klar?"
        aria-label="Din vision"
      />
      <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
        <Mail size={17} aria-hidden="true" />
        {status === "sending" ? "Sender…" : "Send forespørgsel"}
      </button>
      <p className="request-status" role="status" data-state={status}>
        {status === "sent" && "Tak! Din forespørgsel er sendt. Jeg svarer inden for 24 timer."}
        {status === "error" &&
          `Noget gik galt, og din forespørgsel blev ikke sendt. Prøv igen, eller skriv til ${EMAIL}.`}
      </p>
    </form>
  );
}

function Index() {
  // Links like "Tilbage til cases" arrive as /#cases. Once the router has scrolled there, tidy
  // the address back to / so the hash doesn't linger (or send a later refresh back there).
  const hash = useLocation({ select: (location) => location.hash });
  const navigate = useNavigate();
  useEffect(() => {
    if (!hash) return;
    const timer = window.setTimeout(
      () => void navigate({ to: "/", replace: true, resetScroll: false }),
      1200,
    );
    return () => window.clearTimeout(timer);
  }, [hash, navigate]);

  const handleAnchorClick = (event: MouseEvent<HTMLElement>) => {
    const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!anchor || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const target = document.querySelector<HTMLElement>(anchor.getAttribute("href") || "#_");
    if (!target) return;
    event.preventDefault();
    scrollToTarget(target);
  };

  return (
    <main id="main-content" className="site-shell" onClick={handleAnchorClick}>
      <SiteHeader isHome />

      {/* 00 — I dag: فردا floats in the night */}
      <section id="top" className="hero" data-phase="0">
        <div className="wrap hero-wrap">
          <div className="hero-copy">
            <h1 className="hero-title enter" style={{ "--i": 1 } as CSSProperties}>
              Websites og webapps til virksomheder, der bygger til <em>i morgen</em>.
            </h1>
            <p className="hero-sub enter" style={{ "--i": 2 } as CSSProperties}>
              FARDA er et AI-native konsulenthus i København. Du arbejder direkte med den, der
              designer og koder din løsning — fra første skitse til lancering.
            </p>
            <div className="hero-actions enter" style={{ "--i": 3 } as CSSProperties}>
              <a href="#kontakt" className="btn btn-primary">
                Kontakt FARDA <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a href="#services" className="btn btn-ghost">
                Se priserne
              </a>
            </div>
          </div>
          <dl className="hero-facts enter" style={{ "--i": 4 } as CSSProperties}>
            <div>
              <dt>Websites fra, ekskl. moms</dt>
              <dd>5.000 kr.</dd>
            </div>
            <div>
              <dt>Svar inden for</dt>
              <dd>24 timer</dd>
            </div>
            <div>
              <dt>Sprog</dt>
              <dd>Dansk · Engelsk</dd>
            </div>
          </dl>
        </div>
        <a href="#services" className="scroll-cue" aria-label="Scroll til priserne">
          <span>Scroll, og se din side blive bygget</span>
          <i aria-hidden="true" />
        </a>
      </section>

      {/* 01 — Strategi: the letters fall into a blueprint */}
      <section id="services" className="section section-right" data-phase="1">
        <div className="wrap section-grid">
          <div className="section-col">
            <Eyebrow phase="01" label="Strategi" />
            <h2 className="section-title">Pakker og priser</h2>
            <p className="section-lead">
              Strategi, design og udvikling i ét forløb. Vælg niveauet, der passer til din
              virksomhed i dag.
            </p>
            <div className="sheets">
              {packages.map((item) => (
                <article
                  key={item.title}
                  className={`sheet panel ${item.featured ? "sheet-featured" : ""}`}
                >
                  <header className="sheet-head">
                    <span className="mono">{item.sheet}</span>
                    {item.featured && <span className="sheet-flag">Mest valgt</span>}
                  </header>
                  <h3 className="sheet-title">{item.title}</h3>
                  <p className="sheet-price">
                    {item.price}
                    <span> kr.</span>
                    <small className="sheet-vat">ekskl. moms</small>
                  </p>
                  <p className="sheet-text">{item.description}</p>
                  <ul className="sheet-list">
                    {item.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </article>
              ))}
              <article className="sheet panel" style={{ gridColumn: "1 / -1" }}>
                <header className="sheet-head">
                  <span className="mono">A-03</span>
                  <span className="sheet-flag">Tilvalg</span>
                </header>
                <h3 className="sheet-title">FARDA Vedligehold</h3>
                <p className="sheet-price">
                  400
                  <span> kr. / md.</span>
                  <small className="sheet-vat">ekskl. moms</small>
                </p>
                <p className="sheet-text">
                  Til både Essential og Advanced. Vælg det til, hvis du vil have en udvikler til at
                  holde din løsning kørende. Vælg det fra, og du overtager den selv efter lancering.
                  Du ejer hjemmesiden uanset hvad.
                </p>
                <ul className="sheet-list">
                  <li>Opdateringer, sikkerhed og fejlrettelser</li>
                  <li>Op til 30 min. ændringer om måneden</li>
                  <li>Opsiges med 30 dages varsel</li>
                </ul>
              </article>
            </div>
            <div className="compare panel">
              <table>
                <caption>Forskellen på Essential og Advanced</caption>
                <thead>
                  <tr>
                    <th scope="col">
                      <span className="sr-only">Indhold</span>
                    </th>
                    <th scope="col">Essential</th>
                    <th scope="col">Advanced</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map(([label, essential, advanced]) => (
                    <tr key={label}>
                      <th scope="row">{label}</th>
                      <td>{essential}</td>
                      <td>{advanced}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="sheet-text price-note panel">
              <strong>Alle priser er ekskl. moms.</strong> Moms på 25 % lægges til på fakturaen, og
              er din virksomhed momsregistreret, får du den tilbage. Ud over det kommer der ingen
              skjulte gebyrer. Domæne og hosting står i dit navn og betales direkte til udbyderen.
              Læs mere i{" "}
              <Link className="link" to="/vilkaar">
                handelsbetingelserne
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* 02 — Design: the plan rises into a drawing of a skyline */}
      <section id="cases" className="section section-left" data-phase="2">
        <div className="wrap section-grid">
          <div className="section-col section-col-wide">
            <Eyebrow phase="02" label="Design" />
            <h2 className="section-title">Udvalgte cases</h2>
            <p className="section-lead">
              To platforme, hvor strategi, form og funktion hænger sammen i ét system.
            </p>
            <div className="cases">
              {cases.map((item) => (
                <Link key={item.id} to={item.path} className="case-card panel">
                  <span className="case-media">
                    <img
                      src={item.image}
                      alt=""
                      width={1600}
                      height={1100}
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <span className="case-body">
                    <span className="mono case-meta">
                      {item.number} — {item.category}
                    </span>
                    <strong className="case-title">{item.title}</strong>
                    <span className="case-text">{item.description}</span>
                    <span className="case-link">
                      Se casen <ArrowUpRight size={16} aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 03 — Udvikling: the city turns solid and its windows light */}
      <section id="about" className="section section-right" data-phase="3">
        <div className="wrap section-grid">
          <div className="section-col">
            <Eyebrow phase="03" label="Udvikling" />
            <h2 className="section-title">Én person fra skitse til kode</h2>
            <div className="founder panel">
              <img src={pmPic} alt="Persian Moradi" width={88} height={88} loading="lazy" />
              <span>
                <strong>Persian Moradi</strong>
                <span>
                  Founder og full-stack udvikler. Din direkte kontakt gennem hele forløbet.
                </span>
              </span>
            </div>
            <div className="about-panel panel">
              <ul className="pillars">
                {pillars.map((pillar, index) => (
                  <li key={pillar.title}>
                    <span className="mono">0{index + 1}</span>
                    <span>
                      <strong>{pillar.title}</strong>
                      <span>{pillar.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <ol className="route" aria-label="Forløbet">
                {steps.map((step, index) => (
                  <li key={step.label} className="route-step">
                    <span className="route-dot" aria-hidden="true" />
                    <span className="mono">0{index + 1}</span>
                    <strong>{step.label}</strong>
                    <span>{step.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* 04 — Lancering: the sun rises and your building goes up on the last empty plot */}
      <section id="kontakt" className="section contact" data-phase="4">
        <div className="wrap section-grid">
          <div className="contact-copy">
            <Eyebrow phase="04" label="Lancering" />
            <h2 className="section-title">Skriv din vision til mig</h2>
            <p className="section-lead">
              Fortæl med dine egne ord, hvad du drømmer om at bygge. Så aftaler vi et uforpligtende
              møde, hvor vi sammen finder vejen dertil.
            </p>
            <RequestForm />
            <ol className="contact-steps panel" aria-label="Sådan kommer vi i gang">
              {contactSteps.map((step, index) => (
                <li key={step.title}>
                  <span className="mono">0{index + 1}</span>
                  <strong>{step.title}</strong>
                  <span>{step.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <SiteFooter isHome />
    </main>
  );
}
