import { services } from "./services";
import { about } from "./about";
import editorial from "./data/editorial.json";
import site from "./data/site.json";
export { site };
export type CaseStudy = {
  slug: string;
  title: string;
  summary: string;
  challenge: string;
  solution: string;
  outcome: string;
  approved: boolean;
  preview: boolean;
};
export type Article = {
  slug: string;
  title: string;
  summary: string;
  author: string;
  date: string;
  paragraphs: string[];
  draft: boolean;
};
export type Vacancy = {
  id: string;
  title: string;
  location: string;
  description: string;
};
// Unapproved scenarios are local design previews, never production project claims.
export const caseStudiesList: CaseStudy[] = editorial.caseStudies.filter(item => item.approved || (import.meta.env.DEV && item.preview));
export const articlesList: Article[] = editorial.articles;

export const content = {
  company: "Mediastris Healthcare LLP",
  address:
    "404, The Orion Business Park, Shimpoli Signal, Opposite to HDFC Bank, Natakwala Lane, Near Tehsildar Office, Borivali West, Mumbai, Maharashtra.",
  overview: about.company.introduction.join("\n\n") || site.home.introduction,
  mission: about.mission.paragraphs.join("\n\n") || "Explore our proposed direction and working priorities.",
  vision: about.vision.paragraphs.join("\n\n") || "A draft perspective on supporting thoughtful healthcare administration.",
  values: about.values.map((value) => value.title).join(", ") || "Integrity, collaboration, accountability and continuous improvement.",
  services,
  caseStudies: caseStudiesList,
  articles: articlesList,
  vacancies: [] as Vacancy[],
};
const phone = import.meta.env.VITE_CONTACT_PHONE?.trim() || "";
const email = import.meta.env.VITE_CONTACT_EMAIL?.trim() || "";
const whatsapp = import.meta.env.VITE_WHATSAPP_NUMBER?.trim() || "";
export const contact = {
  phone: /^\+?[\d ()-]{7,24}$/.test(phone) ? phone : "",
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "",
  whatsapp: /^\d{8,15}$/.test(whatsapp) ? whatsapp : "",
};
export const maps = {
  embed: `https://maps.google.com/maps?q=${encodeURIComponent(content.address)}&output=embed`,
  directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(content.address)}`,
};
export const images = {
  hero: {
    src: "/images/healthcare.webp",
    alt: "Stock photograph of a healthcare professional in a clinical setting",
  },
  collaboration: {
    src: "/images/collaboration.webp",
    alt: "Stock photograph of a professional workspace",
  },
};
export const navigation = [
  ["/", "Home"],
  ["/about-us", "About us"],
  ["/services", "Services"],
  ["/case-studies", "Case studies"],
  ["/insights", "Insights"],
  ["/careers", "Careers"],
  ["/contact", "Contact us"],
] as const;
