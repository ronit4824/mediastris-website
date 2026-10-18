import { NavLink, useLocation } from "react-router-dom";
import { about } from "./about";
import NavigationDisclosure from "./NavigationDisclosure";
import ServiceIcon from "./ServiceIcon";

export default function AboutNavigation({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { pathname } = useLocation();
  return (
    <NavigationDisclosure
      id="about-navigation"
      label="About us"
      triggerLabel="Explore about us"
      regionLabel="About us navigation"
      open={open}
      active={pathname === "/about" || pathname.startsWith("/about-us")}
      onOpenChange={onOpenChange}
      panelClassName="about-nav-panel"
    >
      <div className="about-menu-intro">
        <p className="eyebrow">GET TO KNOW US</p>
        <h2>
          A closer look
          <br />
          at Mediastris.
        </h2>
        <p>Our company, our direction and the people behind the name.</p>
      </div>
      <ul className="about-menu-links">
        {about.pages.map((page) => (
          <li key={page.id}>
            <NavLink
              to={page.path}
              end
              onClick={() => onOpenChange(false)}
              className={({ isActive }) =>
                `service-menu-link ${isActive || (page.id === "overview" && pathname === "/about") ? "active" : ""}`
              }
            >
              <span className="menu-service-icon">
                <ServiceIcon name={page.icon} />
              </span>
              <span>{page.label}</span>
              <span className="menu-service-arrow" aria-hidden="true">
                ↗
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </NavigationDisclosure>
  );
}
