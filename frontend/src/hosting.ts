// Public assets in JSON are stored relative to the site root, not the domain root.
export function publicAsset(src: string): string {
  return src.startsWith("/") && !src.startsWith("//")
    ? `${import.meta.env.BASE_URL}${src.slice(1)}`
    : src;
}

const backend = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, "") || "";
const pagesBuild = import.meta.env.PROD && import.meta.env.BASE_URL === "/mediastris-website/";
export const apiAvailable = !!backend || !pagesBuild;
export function apiUrl(path: string): string {
  if (!apiAvailable) throw new Error("Backend is not configured for this preview.");
  return `${backend}${path}`;
}
