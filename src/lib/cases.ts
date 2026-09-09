import aiPlatformImage from "@/assets/case-ai-platform.jpg.asset.json";
import spkstotteImage from "@/assets/case-spkstotte.jpg.asset.json";

export type CaseStudy = {
  slug: string;
  name: string;
  category: string;
  image: string;
  year: string;
  description: string;
  client: string;
  scope: string;
  delivery: string;
  statement: string;
  challenge: string;
  direction: string;
  solution: string;
  outcome: string;
  gallery: readonly string[];
};

export const caseStudies: readonly CaseStudy[] = [
  {
    slug: "spkstotte",
    name: "SPKstøtte",
    category: "Webdesign · Offentlig sektor",
    image: spkstotteImage.url,
    year: "2026",
    description: "Et troværdigt offentligt site til en socialpædagogisk virksomhed, der skal vinde kommunal tillid.",
    client: "SPKstøtte",
    scope: "Strategi, webdesign, SEO, tekst",
    delivery: "Live 2026",
    statement: "Et troværdigt, myndighedsrettet site, der taler sagsbehandlerens sprog og konverterer via én klar kontaktvej.",
    challenge: "SPKstøtte leverer socialpædagogiske ydelser til børn og familier under Barnets Lov. Deres købere er kommunale sagsbehandlere, der hurtigt skal kunne stole på en leverandør og forstå syv lovdefinerede ydelser — hver knyttet til et bestemt lovafsnit — uden at drukne i fagsprog.",
    direction: "Retningen blev en rolig, institutionel visuel tone med masser af luft, tydelig typografi og en struktur, der lader hver ydelse stå klart. Tillid kommer først, så indholdet skal føles autoritativt og menneskeligt på én gang.",
    solution: "Jeg designede og byggede et hurtigt, SEO-optimeret multisidesite i Next.js med Claude Code: hver ydelse knyttet til sit lovgrundlag, en tydelig femtrinsproces, en metodesektion og en dedikeret samarbejdsside til kommuner. Dansk lokaliseret, med korrekte metadata, Open Graph-billeder, semantisk struktur og tilgængelig skip-to-content-flow.",
    outcome: "En troværdig, myndighedsrettet tilstedeværelse, der taler sagsbehandlerens sprog og konverterer via én klar kontaktvej. Live på spkstotte.dk og fuldt indekseret.",
    gallery: [spkstotteImage.url, aiPlatformImage.url],
  },
  {
    slug: "ministeriets-ai-platform",
    name: "Ministeriets AI-Platform",
    category: "Produktdesign · AI · Uddannelse",
    image: aiPlatformImage.url,
    year: "2026",
    description: "En AI-læringsplatform til danske gymnasier, designet så AI støtter tænkning i stedet for at erstatte den.",
    client: "Eksamensprojekt",
    scope: "Produktstrategi, UX, UI, Next.js",
    delivery: "Hovedeksamen 2026",
    statement: "En klar, forsvarlig holdning til AI i undervisningen — leveret som hovedeksamen og et produkttænkningsprojekt.",
    challenge: "Generativ AI gør det nemt for elever at aflaste selve tænkningen. Skolerne (STX, HTX, HHX) har ikke brug for endnu en svarmaskine — de har brug for AI, der styrker læring i stedet for at kortslutte den.",
    direction: "Løsningen skulle ikke give hurtige svar, men støtte den lærendes egen tankeproces. Retningen blev en 'scaffolding AI' med bevidst friktion og sokratisk vejledning frem for færdige løsninger.",
    solution: "Jeg designede og prototypede en konto-baseret webapp bygget med Next.js og Claude Code. Platformen bygger på to principper: Friction by Design — produktiv friktion frem for øjeblikkelige svar — og den sokratiske metode, hvor AI'en stiller spørgsmål og guider frem for at løse opgaven.",
    outcome: "En deployed, fungerende prototype med en klar, forsvarlig holdning til AI i uddannelsen — leveret som hovedeksamen og et bevis på produkttænkning, ikke bare en feature.",
    gallery: [aiPlatformImage.url, spkstotteImage.url],
  },
] as const;

export function getCaseStudy(slug: string) {
  return caseStudies.find((study) => study.slug === slug);
}

export function getNextCaseStudy(slug: string) {
  const index = caseStudies.findIndex((study) => study.slug === slug);
  if (index < 0) return caseStudies[0];
  return caseStudies[(index + 1) % caseStudies.length];
}
