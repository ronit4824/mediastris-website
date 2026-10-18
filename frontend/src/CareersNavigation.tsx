import { NavLink, useLocation } from "react-router-dom";
import { careers } from "./careers";
import NavigationDisclosure from "./NavigationDisclosure";
import ServiceIcon from "./ServiceIcon";
export default function CareersNavigation({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { pathname } = useLocation();
  return (
    <NavigationDisclosure
      id="careers-navigation"
      label="Careers"
      triggerLabel="Explore careers"
      regionLabel="Careers navigation"
      open={open}
      active={pathname.startsWith("/careers")}
      onOpenChange={onOpenChange}
      panelClassName="about-nav-panel careers-nav-panel"
    >
      <div className="about-menu-intro">
        <p className="eyebrow">YOUR NEXT CHAPTER</p>
        <h2>
          Explore what
          <br />
          could come next.
        </h2>
        <p>Career perspectives, learning and approved opportunities.</p>
      </div>
      <ul className="about-menu-links">
        {careers.pages.slice(1).map((page) => (
          <li key={page.path}>
            <NavLink
              end
              to={page.path}
              className={({ isActive }) =>
                `service-menu-link ${isActive ? "active" : ""}`
              }
              onClick={() => onOpenChange(false)}
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
