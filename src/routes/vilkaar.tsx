import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { absoluteUrl } from "@/lib/seo";

const title = "Handelsbetingelser — FARDA";
const description =
  "FARDAs handelsbetingelser: priser, betaling, domæne og hosting, ejerskab af hjemmesiden og vedligehold.";
const url = absoluteUrl("/vilkaar");

export const Route = createFileRoute("/vilkaar")({
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
  component: Terms,
});

const MAIL = "farda0@protonmail.com";

function Terms() {
  return (
    <main id="main-content" className="site-shell case-page">
      <SiteHeader />

      <section className="case-hero">
        <div className="wrap">
          <Link className="link case-back" to="/">
            <ArrowLeft size={15} aria-hidden="true" /> Forsiden
          </Link>
          <p className="mono case-hero-meta">Senest opdateret 23. november 2026</p>
          <h1 className="case-hero-title">Handelsbetingelser</h1>
          <p className="case-hero-intro">
            Kort fortalt: Du betaler for at få din hjemmeside bygget, og når den er betalt, ejer du
            den. Domæne og hosting står i dit navn, og dem betaler du selv direkte til udbyderen.
          </p>
        </div>
      </section>

      <section className="case-content">
        <div className="wrap">
          <article className="legal panel">
            <h2>1. Om aftalen</h2>
            <p>
              Disse betingelser gælder for alle opgaver, som FARDA, København, Danmark, udfører
              for erhvervskunder. Et skriftligt tilbud eller en individuel aftale går forud for
              betingelserne, hvis de siger noget forskelligt.
            </p>

            <h2>2. Ydelser og priser</h2>
            <ul>
              <li>
                <strong>FARDA Essential</strong>: 5.000 kr. (engangsbeløb)
              </li>
              <li>
                <strong>FARDA Advanced</strong>: 8.000 kr. (engangsbeløb)
              </li>
              <li>
                <strong>FARDA Vedligehold</strong>: 299 kr. pr. måned (valgfrit tilvalg)
              </li>
            </ul>
            <p>
              Hvad der præcist indgår, fremgår af pakken på forsiden og af dit tilbud. FARDA er
              ikke momsregistreret, så alle priser er endelige, og der lægges ikke moms oveni.
            </p>

            <h2>3. Betaling</h2>
            <ul>
              <li>50 % af prisen faktureres ved opstart, og arbejdet går i gang, når beløbet er betalt.</li>
              <li>De resterende 50 % faktureres ved lancering, før hjemmesiden overdrages.</li>
              <li>Betalingsfristen er 8 dage fra fakturadato.</li>
            </ul>
            <p>Betales en faktura ikke til tiden, kan FARDA sætte arbejdet på pause.</p>

            <h2>4. Forløb og rettelser</h2>
            <p>
              FARDA Essential indeholder 2 rettelsesrunder, og FARDA Advanced indeholder 4. Ønsker
              du flere rettelser eller arbejde ud over det aftalte, koster det 600 kr. i timen, og vi aftaler det altid med dig, før vi
              går i gang.
            </p>
            <p>
              Du leverer tekster, billeder og logo til tiden. Kommer materialet senere end aftalt,
              rykker tidsplanen tilsvarende.
            </p>

            <h2>5. Domæne og hosting</h2>
            <p>
              Domæne og hosting indgår ikke i prisen. De står altid i dit eget navn, og du betaler
              dem direkte til udbyderen, fx Simply.com, One.com eller Vercel.
            </p>
            <ul>
              <li>
                <strong>Har du allerede et domæne</strong>, kobler FARDA den nye hjemmeside til
                det.
              </li>
              <li>
                <strong>Har du ikke et domæne eller en hjemmeside</strong>, hjælper FARDA dig med
                at oprette konti hos udbyderne i dit navn, og du betaler selv for dem.
              </li>
            </ul>
            <p>
              FARDA er ikke ansvarlig for udbydernes priser, nedetid eller ændrede vilkår.
            </p>

            <h2>6. Konti og kode</h2>
            <p>
              Under projektet bygger FARDA hjemmesiden i sin egen kodebase. Ved overdragelsen
              flyttes koden til din egen GitHub-konto, og hjemmesiden lægges på din egen
              hosting-konto. FARDA får adgang som medlem af dine konti, så længe projektet eller
              en vedligeholdelsesaftale løber. Derefter kan du til enhver tid fjerne adgangen.
            </p>

            <h2>7. Ejerskab og rettigheder</h2>
            <p>
              Når den sidste faktura er betalt, ejer du hjemmesiden, herunder koden, designet og
              det indhold, der er lavet til dig. Det gælder, uanset om du vælger vedligehold eller
              ej. Indtil alt er betalt, ligger rettighederne hos FARDA.
            </p>
            <ul>
              <li>
                FARDA beholder retten til at genbruge sin generelle viden, metoder og
                standardkomponenter i andre opgaver.
              </li>
              <li>
                FARDA må vise projektet i sin portefølje, medmindre du skriftligt beder om andet.
              </li>
              <li>
                Skrifttyper, billeder, ikoner og andre tjenester fra tredjepart følger deres egne
                licenser.
              </li>
              <li>
                Du står inde for, at du har rettighederne til de tekster og billeder, du selv
                leverer.
              </li>
            </ul>

            <h2>8. Vedligehold</h2>
            <p>
              Vedligehold er et valgfrit abonnement til 299 kr. pr. måned, der betales forud
              hver måned. Det indeholder:
            </p>
            <ul>
              <li>opdatering af tekniske afhængigheder og sikkerhedsrettelser</li>
              <li>løbende tjek af, at hjemmesiden kører</li>
              <li>rettelse af fejl i den kode, FARDA har leveret</li>
              <li>
                op til 30 minutters ændringer om måneden, fx tekster, billeder, priser og mindre
                justeringer
              </li>
            </ul>
            <p>
              Ubrugt tid overføres ikke til næste måned. Større opgaver, fx nye sider eller nye
              funktioner, koster 600 kr. i timen og aftales på forhånd.
            </p>
            <p>
              Vedligehold opsiges skriftligt på e-mail med 30 dages varsel. Når aftalen ophører,
              fjernes FARDAs adgang til dine konti, og du beholder hjemmesiden og alle konti
              uændret.
            </p>

            <h2>9. Ansvar</h2>
            <p>
              FARDA udfører arbejdet omhyggeligt og efter bedste faglige standard. FARDA er ikke
              ansvarlig for indirekte tab, fx tabt omsætning eller avance. FARDAs samlede ansvar er
              begrænset til det beløb, du har betalt for den pågældende opgave, og for vedligehold
              til det beløb, du har betalt de seneste 12 måneder.
            </p>

            <h2>10. Persondata</h2>
            <p>
              Får FARDA under arbejdet eller vedligeholdet adgang til personoplysninger i dine
              systemer, fx henvendelser fra din kontaktformular, behandler FARDA dem kun på dine
              vegne som databehandler, og vi indgår en databehandleraftale, når du beder om det.
              Hvordan FARDA behandler oplysninger om dig selv, står i vores{" "}
              <Link className="link" to="/privacy">
                privatlivspolitik
              </Link>
              .
            </p>

            <h2>11. Lovvalg</h2>
            <p>
              Aftalen er underlagt dansk ret. Kan vi ikke finde en løsning sammen, afgøres en
              eventuel tvist ved de danske domstole.
            </p>

            <h2>Spørgsmål</h2>
            <p>
              Skriv til{" "}
              <a className="link" href={`mailto:${MAIL}`}>
                {MAIL}
              </a>
              , hvis noget er uklart.
            </p>
          </article>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
