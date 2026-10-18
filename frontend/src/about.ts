import data from "./data/about.json";
import type { ServiceIconName } from "./services";

export type AboutImage = { src: string; alt: string; position: string };
export type AboutPageId = "overview" | "vision" | "management" | "ceo";
export type AboutPage = {
  id: AboutPageId;
  path: string;
  label: string;
  title: string;
  description: string;
  icon: ServiceIconName;
};
export type LeadershipMember = {
  id: string;
  name: string;
  designation: string;
  biography: string[];
  photo: AboutImage | null;
  featured?: boolean;
};
export type AboutContent = {
  draftNote: string;
  fallbackText: string;
  valuesFallback: { title: string; description: string };
  pages: AboutPage[];
  company: {
    introduction: string[];
    story: string[];
    storyHeading: string | null;
    primaryImage: AboutImage;
    supportingImage: AboutImage;
  };
  values: { id: string; title: string; description: string }[];
  valuesNote?: string | null;
  vision: { paragraphs: string[]; image: AboutImage; summary: string };
  mission: { paragraphs: string[] };
  leadership: {
    introduction: string[];
    members: LeadershipMember[];
    emptyHeading: string;
    emptyText: string;
  };
  ceo: {
    heading: string | null;
    paragraphs: string[];
    name: string | null;
    designation: string | null;
    portrait: AboutImage | null;
    note: string;
  };
};
// Proposed copy is visibly labelled; individual leadership facts await approval.
export const about = data as AboutContent;
export const aboutPage = (id: AboutPageId) =>
  about.pages.find((page) => page.id === id)!;
