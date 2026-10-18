import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";

type Props = {
  id: string;
  label: string;
  triggerLabel: string;
  regionLabel: string;
  open: boolean;
  active: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  panelClassName?: string;
};
// Shared navigation disclosure for About and Services. Ordinary links keep native Tab semantics.
export default function NavigationDisclosure({
  id,
  label,
  triggerLabel,
  regionLabel,
  open,
  active,
  onOpenChange,
  children,
  panelClassName = "",
}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingFocus = useRef(false);
  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) {
        cancelClose();
        onOpenChange(false);
      }
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open, onOpenChange]);
  useEffect(() => {
    const breakpoint = matchMedia("(max-width: 900px)");
    const reset = () => {
      cancelClose();
      onOpenChange(false);
    };
    breakpoint.addEventListener("change", reset);
    return () => {
      breakpoint.removeEventListener("change", reset);
      cancelClose();
    };
  }, [onOpenChange]);
  useEffect(() => {
    if (open && pendingFocus.current) {
      panel.current?.querySelector<HTMLAnchorElement>("a")?.focus();
      pendingFocus.current = false;
    }
    if (!open) cancelClose();
  }, [open]);
  function keydown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      cancelClose();
      onOpenChange(false);
      trigger.current?.focus();
    }
    if (event.target === trigger.current && event.key === "ArrowDown") {
      event.preventDefault();
      if (open) panel.current?.querySelector<HTMLAnchorElement>("a")?.focus();
      else {
        pendingFocus.current = true;
        onOpenChange(true);
      }
    }
  }
  return (
    <div
      ref={root}
      className="services-nav"
      onKeyDown={keydown}
      onPointerEnter={(event) => {
        if (
          event.pointerType === "mouse" &&
          matchMedia("(min-width: 901px) and (hover: hover)").matches
        ) {
          cancelClose();
          onOpenChange(true);
        }
      }}
      onPointerLeave={(event) => {
        if (
          event.pointerType === "mouse" &&
          matchMedia("(min-width: 901px)").matches
        ) {
          cancelClose();
          closeTimer.current = setTimeout(() => {
            if (!root.current?.contains(document.activeElement))
              onOpenChange(false);
          }, 180);
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          cancelClose();
          onOpenChange(false);
        }
      }}
    >
      <button
        ref={trigger}
        className={`services-trigger ${active ? "active" : ""}`}
        type="button"
        aria-label={triggerLabel}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          cancelClose();
          onOpenChange(!open);
        }}
      >
        {label}{" "}
        <svg aria-hidden="true" viewBox="0 0 12 12" fill="none">
          <path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      </button>
      <div
        ref={panel}
        id={id}
        role="region"
        aria-label={regionLabel}
        aria-hidden={!open}
        inert={!open}
        className={`services-panel ${panelClassName}`}
        data-open={open}
      >
        {children}
      </div>
    </div>
  );
}
