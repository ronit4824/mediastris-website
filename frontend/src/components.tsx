import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { contact, content, navigation, site } from "./content";
import ServicesNavigation from "./ServicesNavigation";
import AboutNavigation from "./AboutNavigation";
import CareersNavigation from "./CareersNavigation";
import { publicAsset } from "./hosting";

export type Theme = "dark" | "light";

export type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("mediastris-theme");
        if (saved === "light" || saved === "dark") return saved;
      } catch { /* Theme switching remains available when storage is blocked. */ }
      return "dark";
    }
    return "dark";
  });

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("mediastris-theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? (
        <svg
          className="theme-icon sun-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg
          className="theme-icon moon-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
      <span className="theme-toggle-label">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true">{diagonal ? "↗" : "↗"}</span>;
}
export function Button({
  to,
  children,
  secondary = false,
}: {
  to: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link className={`button ${secondary ? "button-secondary" : ""}`} to={to}>
      {children}
      <Arrow />
    </Link>
  );
}
export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`section ${className}`}>
      {children}
    </section>
  );
}
export function Card({ children }: { children: ReactNode }) {
  return <article className="card">{children}</article>;
}
export function CTA() {
  return (
    <Section className="cta">
      <div>
        <p className="eyebrow">LET’S CONNECT</p>
        <h2>
          A conversation is a<br />
          good place to start.
        </h2>
      </div>
      <div>
        <p>Share your organization’s priorities, the service area you are exploring and the next question you would like to resolve.</p>
        <Button to="/contact">Start a conversation</Button>
      </div>
    </Section>
  );
}
function Wordmark() {
  return (
    <Link to="/" className="wordmark" aria-label="Mediastris Healthcare home">
      <svg
        className="brand-logo"
        viewBox="0 0 3028 405"
        role="img"
        aria-label="Mediastris Healthcare LLP"
      >
        <image
          href={publicAsset("/images/mediastris-horizontal.png")}
          width="3028"
          height="405"
          preserveAspectRatio="xMidYMid meet"
        />
      </svg>
    </Link>
  );
}
export function Header() {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState<
    "about" | "services" | "careers" | null
  >(null);
  const setCareersOpen = useCallback(
    (value: boolean) =>
      setDropdown((current) =>
        value ? "careers" : current === "careers" ? null : current,
      ),
    [],
  );
  const setAboutOpen = useCallback(
    (value: boolean) =>
      setDropdown((current) =>
        value ? "about" : current === "about" ? null : current,
      ),
    [],
  );
  const setServicesOpen = useCallback(
    (value: boolean) =>
      setDropdown((current) =>
        value ? "services" : current === "services" ? null : current,
      ),
    [],
  );
  const location = useLocation();
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setOpen(false);
    setDropdown(null);
  }, [location.pathname]);
  useEffect(() => {
    if (!open) setDropdown(null);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  return (
    <header className="header">
      <Wordmark />
      <nav
        id="main-navigation"
        aria-label="Main navigation"
        className={open ? "navigation open" : "navigation"}
      >
        {navigation.map(([path, label]) =>
          path === "/services" ? (
            <ServicesNavigation
              key={path}
              open={dropdown === "services"}
              onOpenChange={setServicesOpen}
            />
          ) : path === "/about-us" ? (
            <AboutNavigation
              key={path}
              open={dropdown === "about"}
              onOpenChange={setAboutOpen}
            />
          ) : path === "/careers" ? (
            <CareersNavigation
              key={path}
              open={dropdown === "careers"}
              onOpenChange={setCareersOpen}
            />
          ) : (
            <NavLink
              key={path}
              to={path}
              end
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {label}
            </NavLink>
          ),
        )}
      </nav>
      <div className="header-actions">
        <ThemeToggle />
        <Link className="header-cta" to="/contact">
          Let’s talk <Arrow />
        </Link>
        <button
          ref={toggle}
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close ×" : "Menu ☰"}
        </button>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer>
      <div className="footer-main">
        <div>
          <Wordmark />
          <p>{site.footerDescription}</p>
        </div>
        <div>
          <h2>Explore</h2>
          {navigation.slice(1, 5).map(([p, l]) => (
            <Link key={p} to={p}>
              {l}
            </Link>
          ))}
        </div>
        <div>
          <h2>Connect</h2>
          <Link to="/careers">Careers</Link>
          <Link to="/contact">Contact us</Link>
          {contact.email && (
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          )}
          {contact.phone && (
            <a href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}>
              {contact.phone}
            </a>
          )}
        </div>
        <div>
          <h2>Find us</h2>
          <address>{content.address}</address>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Mediastris Healthcare LLP</span>
        <span>Preview website · Client content pending</span>
      </div>
    </footer>
  );
}
export function Layout() {
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  const previous = useRef(pathname);
  useEffect(() => {
    window.scrollTo(0, 0);
    if (previous.current !== pathname) main.current?.focus();
    previous.current = pathname;
  }, [pathname]);
  return (
    <ThemeProvider>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1} ref={main}>
        <Outlet />
      </main>
      <Footer />
      {(contact.whatsapp || contact.phone || contact.email) && (
        <aside className="floating-contact" aria-label="Quick contact">
          {contact.whatsapp && (
            <a
              href={`https://wa.me/${contact.whatsapp}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp ↗
            </a>
          )}
          {contact.phone && (
            <a href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}>Call</a>
          )}
          {contact.email && <a href={`mailto:${contact.email}`}>Email</a>}
        </aside>
      )}
    </ThemeProvider>
  );
}
export function Meta({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = `${title} | Mediastris Healthcare LLP`;
    const set = (key: string, value: string, property = false) => {
      const selector = property ? "property" : "name";
      let el = document.head.querySelector<HTMLMetaElement>(
        `meta[${selector}="${key}"]`,
      );
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(selector, key);
        document.head.appendChild(el);
      }
      el.content = value;
    };
    set("description", description);
    set("og:title", document.title, true);
    set("og:description", description, true);
    const site = import.meta.env.VITE_SITE_URL;
    if (site && /^https:\/\//.test(site)) {
      set("og:url", `${site.replace(/\/$/, "")}${pathname}`, true);
      let link = document.head.querySelector<HTMLLinkElement>(
        "link[rel=canonical]",
      );
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = `${site.replace(/\/$/, "")}${pathname}`;
    }
  }, [title, description, pathname]);
  return null;
}
export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="page-intro">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span>{eyebrow}</span>
      </div>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="intro-description">{description}</p>
    </section>
  );
}
export function EmptyState({
  category,
  title,
  text,
}: {
  category: string;
  title: string;
  text: string;
}) {
  return (
    <div className="empty-state">
      <span className="empty-symbol" aria-hidden="true">
        ↗
      </span>
      <div>
        <p className="eyebrow">{category}</p>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    </div>
  );
}
