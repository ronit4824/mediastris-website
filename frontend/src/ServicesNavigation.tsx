import { Link, NavLink, useLocation } from "react-router-dom";
import { services } from "./services";
import ServiceIcon from "./ServiceIcon";
import NavigationDisclosure from "./NavigationDisclosure";

// Services content uses the shared navigation disclosure.
export default function ServicesNavigation({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { pathname } = useLocation();
  return (
    <NavigationDisclosure
      id="services-navigation"
      label="Services"
      triggerLabel="Explore services"
      regionLabel="Services navigation"
      open={open}
      active={pathname.startsWith("/services")}
      onOpenChange={onOpenChange}
    >
      <div className="services-menu-intro">
        <p className="eyebrow">EXPLORE OUR SERVICES</p>
        <h2>
          A broader view.
          <br />A focused conversation.
        </h2>
        <p>
          Eight proposed service areas.
          <br />
          One place to find your starting point.
        </p>
        <Link to="/services" onClick={() => onOpenChange(false)}>
          View all services <span aria-hidden="true">↗</span>
        </Link>
        <span className="menu-draft-note">
          Provisional portfolio · Client verification pending
        </span>
      </div>
      <ul className="services-menu-links">
        {services.map((service) => (
          <li key={service.id}>
            <NavLink
              to={`/services/${service.slug}`}
              className={({ isActive }) =>
                isActive ? "service-menu-link active" : "service-menu-link"
              }
              onClick={() => onOpenChange(false)}
            >
              <span className="menu-service-icon">
                <ServiceIcon name={service.icon} />
              </span>
              <span>{service.title}</span>
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
