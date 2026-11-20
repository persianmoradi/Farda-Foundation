import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { absoluteUrl } from "@/lib/seo";

const title = "Privatlivspolitik — FARDA";
const description =
  "Sådan behandler FARDA personoplysninger, når du kontakter os: hvad vi gemmer, hvorfor, hvor længe og dine rettigheder.";
const url = absoluteUrl("/privacy");

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: url }],
  }),
  component: Privacy,
});

const MAIL = "farda0@protonmail.com";

function Privacy() {
  return (
    <main id="main-content" className="site-shell case-page">
      <SiteHeader />

      <section className="case-hero">
        <div className="wrap">
          <Link className="link case-back" to="/">
            <ArrowLeft size={15} aria-hidden="true" /> Forsiden
          </Link>
          <p className="mono case-hero-meta">Senest opdateret 19. november 2026</p>
          <h1 className="case-hero-title">Privatlivspolitik</h1>
          <p className="case-hero-intro">
            Kort fortalt: Vi bruger kun dine oplysninger til at svare på din henvendelse. Ingen
            cookies, ingen sporing, intet salg.
          </p>
        </div>
      </section>

      <section className="case-content">
        <div className="wrap">
          <article className="legal panel">
            <h2>Dataansvarlig</h2>
            <p>
              FARDA, København, Danmark, er dataansvarlig for de personoplysninger, der behandles via denne
              hjemmeside. Du kan altid kontakte os på{" "}
              <a className="link" href={`mailto:${MAIL}`}>
                {MAIL}
              </a>
              .
            </p>
            <h2>Hvilke oplysninger vi indsamler</h2>
            <p>Når du udfylder kontaktformularen, modtager vi:</p>
            <ul>
              <li>dit navn</li>
              <li>virksomhedens navn</li>
              <li>dit danske telefonnummer</li>
              <li>den pakke, du har valgt</li>
              <li>om du ønsker vedligehold (299 kr./md.)</li>
              <li>din beskrivelse af projektet (din „vision“)</li>
            </ul>
            <p>Skriver du direkte til os på e-mail, modtager vi de oplysninger, du selv sender.</p>

            <h2>Formål og retsgrundlag</h2>
            <p>
              Vi bruger oplysningerne til at svare på din henvendelse og aftale et møde eller give
              dig et tilbud. Retsgrundlaget er databeskyttelsesforordningens (GDPR) artikel 6, stk.
              1, litra b, fordi behandlingen sker på din anmodning forud for en eventuel aftale.
              Hvor det ikke passer, behandler vi oplysningerne på grundlag af vores legitime
              interesse i at besvare henvendelser, jf. artikel 6, stk. 1, litra f.
            </p>
            <p>
              Vi sælger aldrig dine oplysninger, og de bruges ikke til automatiske afgørelser eller
              profilering.
            </p>

            <h2>Hvor længe vi gemmer dem</h2>
            <p>
              Bliver du ikke kunde, sletter vi din henvendelse senest 12 måneder efter vores sidste
              kontakt. Bliver du kunde, gemmer vi oplysninger, der indgår i regnskabet, i 5 år efter
              regnskabsårets afslutning, som bogføringsloven kræver.
            </p>

            <h2>Databehandlere og modtagere</h2>
            <p>Vi deler kun dine oplysninger med de tjenester, der skal til for at drive siden:</p>
            <ul>
              <li>
                <strong>Resend</strong> (USA) leverer formularen som e-mail til vores indbakke.
              </li>
              <li>
                <strong>Proton</strong> (Schweiz) modtager og opbevarer e-mailen. Schweiz er
                godkendt af EU som et land med tilstrækkeligt beskyttelsesniveau.
              </li>
              <li>
                <strong>Vercel</strong> (USA) hoster hjemmesiden og fører serverlogs, som bl.a.
                indeholder din IP-adresse.
              </li>
              <li>
                <strong>Google Fonts</strong> (Google, USA) leverer sidens skrifttyper. Når siden
                indlæses, henter din browser dem fra Googles servere, som derved modtager din
                IP-adresse.
              </li>
            </ul>
            <p>
              Overførsler til USA er omfattet af EU-US Data Privacy Framework eller EU-Kommissionens
              standardkontraktbestemmelser.
            </p>

            <h2>Cookies og sporing</h2>
            <p>
              Siden bruger ingen cookies, ingen analyseværktøjer, ingen sporing og ingen
              annoncering. Browseren gemmer kun din scroll-position midlertidigt i fanen, så siden
              kan vende tilbage til samme sted. Det sendes ikke til nogen og forsvinder, når du
              lukker fanen.
            </p>

            <h2>Dine rettigheder</h2>
            <p>Du har ret til at:</p>
            <ul>
              <li>få indsigt i de oplysninger, vi har om dig</li>
              <li>få urigtige oplysninger rettet</li>
              <li>få dine oplysninger slettet</li>
              <li>få behandlingen begrænset</li>
              <li>få dine oplysninger udleveret i et almindeligt format (dataportabilitet)</li>
              <li>gøre indsigelse mod behandlingen</li>
              <li>trække et eventuelt samtykke tilbage</li>
            </ul>
            <p>
              Skriv til{" "}
              <a className="link" href={`mailto:${MAIL}`}>
                {MAIL}
              </a>
              , så svarer vi inden for en måned.
            </p>

            <h2>Klage</h2>
            <p>
              Er du utilfreds med vores behandling af dine oplysninger, kan du klage til
              Datatilsynet på{" "}
              <a
                className="link"
                href="https://www.datatilsynet.dk"
                target="_blank"
                rel="noreferrer"
              >
                datatilsynet.dk
              </a>
              .
            </p>
          </article>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
