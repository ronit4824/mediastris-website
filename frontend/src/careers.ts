import data from "./data/careers.json";
import type { AboutImage } from "./about";
import type { ServiceIconName } from "./services";
export type Job = {
  id: string;
  title: string;
  approved: boolean;
  preview?: boolean;
  location: string;
  employmentType: string;
  experience: string;
  responsibilities: string[];
  qualifications: string[];
};
type Theme = { title: string; text: string; icon: ServiceIconName };
type CareersContent = {
  pages: {
    path: string;
    title: string;
    description: string;
    label: string;
    icon: ServiceIconName;
  }[];
  generalApplicationsEnabled: boolean;
  jobs: Job[];
  previewJobs: Job[];
  introduction: string;
  heroImage: AboutImage;
  growthImage: AboutImage;
  why: Theme[];
  growth: Theme[];
};
export const careers = data as CareersContent;
export const approvedJobs = careers.jobs.filter((job) => job.approved);
// Samples are visible only in local Vite development; the server never accepts their IDs.
export const displayJobs = approvedJobs.length
  ? approvedJobs
  : import.meta.env.DEV
    ? (careers.previewJobs || []).map((job) => ({
        ...job,
        approved: false,
        preview: true,
      }))
    : [];
export const NO_OPENINGS =
  "We currently don't have any open positions. Please check back for future opportunities.";
