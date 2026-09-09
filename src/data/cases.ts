import spkCaseCard from "@/assets/spk-case-card.png";
import uvmCard from "@/assets/uvm-card.jpg";

export const cases = [
  {
    id: "spk-stotte",
    path: "/work/spkstotte",
    number: "01",
    title: "SPK Støtte",
    category: "Webdesign · Udvikling",
    description:
      "En rolig, tillidsfuld digital platform for faglige metoder, støtteforløb og samarbejde med kommuner.",
    accent: "case-preview-spk",
    image: spkCaseCard,
    websiteUrl: "https://www.spkstotte.dk/",
  },
  {
    id: "ministeriets-ai-platform",
    path: "/work/ministeriets-ai-platform",
    number: "02",
    title: "Ministeriets AI-Platform",
    category: "Produktdesign · AI",
    description:
      "En AI-læringsplatform til danske ungdomsuddannelser, designet til at styrke elevernes tænkning i stedet for at erstatte den.",
    accent: "case-preview-uvm",
    image: uvmCard,
    websiteUrl: "https://multimediedesign-hovedeksamen.vercel.app/",
  },
] as const;

export type Case = (typeof cases)[number];
