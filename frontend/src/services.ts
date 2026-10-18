import inventory from "./data/services.json";

export type ServiceIconName =
  | "shield"
  | "network"
  | "building"
  | "compass"
  | "ledger"
  | "checklist"
  | "heart"
  | "digital";
export type Service = {
  id: string;
  slug: string;
  title: string;
  icon: ServiceIconName;
  image: { src: string; alt: string; position: string };
  shortDescription: string;
  introduction: string;
  overview: string;
  details: string;
  coverage: { title: string; description: string }[];
  discussion: string;
  contactPrompt: string;
  contactLabel: string;
  assistance: string;
  draft: boolean;
};
// Provisional inventory supplied by the user. Names and draft copy await client verification.
export const services = inventory as Service[];
