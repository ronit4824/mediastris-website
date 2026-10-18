import type { ReactNode } from "react";
import type { ServiceIconName } from "./services";

const drawings: Record<ServiceIconName, ReactNode> = {
  shield: (
    <>
      <path d="m12 3 8 3v6c0 4-4 7-8 9-4-2-8-5-8-9V6Z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  network: (
    <>
      <rect x="8" y="3" width="8" height="6" rx="1" />
      <rect x="2" y="16" width="7" height="5" rx="1" />
      <rect x="15" y="16" width="7" height="5" rx="1" />
      <path d="M12 9v4M5.5 16v-3h13v3" />
    </>
  ),
  building: (
    <>
      <path d="M5 21V5h14v16M3 21h18M9 21v-5h6v5M9 9h1m4 0h1M9 12h1m4 0h1" />
      <path d="M10 2v3m4-3v3" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m16 8-2.5 5.5L8 16l2.5-5.5Z" />
    </>
  ),
  ledger: (
    <>
      <path d="M6 3h12v18H6zM9 7h6M9 11h6M9 15h2m2 3h2M3 7h3M3 12h3M3 17h3" />
    </>
  ),
  checklist: (
    <>
      <rect x="5" y="4" width="15" height="17" rx="1" />
      <path d="M10 4V2h5v2M8 9l1 1 2-2m2 1h4M8 15l1 1 2-2m2 1h4" />
    </>
  ),
  heart: (
    <>
      <path d="M20.5 5.5a5 5 0 0 0-7 0L12 7l-1.5-1.5a5 5 0 0 0-7 7L12 21l8.5-8.5a5 5 0 0 0 0-7Z" />
      <path d="M6 12h3l2-3 2 6 2-3h3" />
    </>
  ),
  digital: (
    <>
      <rect x="3" y="3" width="18" height="14" rx="1" />
      <path d="M8 21h8m-4-4v4M7 13l3-3 3 2 4-5m-3 0h3v3" />
    </>
  ),
};
export default function ServiceIcon({ name }: { name: ServiceIconName }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {drawings[name]}
    </svg>
  );
}
