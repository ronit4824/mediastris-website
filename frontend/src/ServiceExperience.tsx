import { Link } from "react-router-dom";
import { Button, Meta, Section } from "./components";
import ServiceIcon from "./ServiceIcon";
import { publicAsset } from "./hosting";
import { services, type Service } from "./services";

export function ServiceCatalogue() {
  return (
    <>
      <div className="catalogue-note">
        <span className="catalogue-note-dot" aria-hidden="true" />
        <p>
          Provisional service portfolio · Names and draft descriptions pending
          client verification.
        </p>
      </div>
      <ul className="services-catalogue">
        {services.map((service, index) => (
          <li key={service.id}>
            <Link
              className="service-card"
              to={`/services/${service.slug}`}
              aria-label={`Explore ${service.title}`}
            >
              <div className="service-card-top">
                <span className="service-icon">
                  <ServiceIcon name={service.icon} />
                </span>
                <span className="service-card-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3>{service.title}</h3>
              <p>{service.shortDescription}</p>
              <div className="service-card-bottom">
                <span>Explore service</span>
                <span className="service-card-arrow" aria-hidden="true">
                  ↗
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <p className="catalogue-draft-note">
        Draft content for client review. Final scope and service availability
        will be confirmed by Mediastris.
      </p>
    </>
  );
}

export function ServiceDetail({ service }: { service: Service }) {
  const number = String(services.indexOf(service) + 1).padStart(2, "0");
  return (
    <>
      <Meta title={service.title} description={service.shortDescription} />
      <section className="service-hero" aria-labelledby="service-title">
        <figure className="service-hero-image">
          <img
            src={publicAsset(service.image.src)}
            alt={service.image.alt}
            width="1600"
            height="960"
            fetchPriority="high"
            style={{ objectPosition: service.image.position }}
          />
          <figcaption>
            Illustrative stock image · Not Mediastris personnel or premises
          </figcaption>
        </figure>
        <div className="service-hero-content">
          <nav className="service-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/services">Services</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{service.title}</span>
          </nav>
          <p className="eyebrow">MEDIASTRIS / SERVICE {number}</p>
          <h1 id="service-title">{service.title}</h1>
          <p className="service-hero-description">{service.shortDescription}</p>
          <div className="service-hero-actions">
            <Button to="/contact">Contact us</Button>
            {service.draft && (
              <span className="service-draft-badge">
                Draft content for client review
              </span>
            )}
          </div>
        </div>
      </section>
      <nav className="service-page-nav" aria-label="On this service page">
        <span>IN THIS SECTION</span>
        <a href="#service-overview">Overview</a>
        <a href="#service-coverage">Potential scope</a>
        <a href="#service-assistance">Mediastris assistance</a>
      </nav>
      <Section id="service-overview" className="service-overview">
        <div>
          <p className="eyebrow">01 / THE CONTEXT</p>
          <h2>Service overview</h2>
          <span className="service-overview-icon" aria-hidden="true">
            <ServiceIcon name={service.icon} />
          </span>
        </div>
        <div>
          <p className="service-lead">{service.introduction}</p>
          <p>{service.overview}</p>
          <p>{service.details}</p>
          <div className="service-review-note">
            <span className="eyebrow">FOR CLIENT REVIEW</span>
            <p>
              Original draft description. The service name, scope and
              availability require final client verification.
            </p>
          </div>
        </div>
      </Section>
      <Section id="service-coverage" className="service-coverage">
        <div className="section-heading">
          <div>
            <p className="eyebrow">02 / POINTS FOR DISCUSSION</p>
            <h2>What this service could cover</h2>
          </div>
          <p>
            Proposed topics to shape a conversation.
            <br />
            These are not confirmed deliverables.
          </p>
        </div>
        <ol className="service-coverage-list">
          {service.coverage.map((topic, index) => (
            <li key={topic.title}>
              <span aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{topic.title}</h3>
                <p>{topic.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>
      <Section id="service-assistance" className="service-assistance">
        <div>
          <p className="eyebrow">03 / THE MEDIASTRIS APPROACH</p>
          <h2>How Mediastris can assist</h2>
          <p className="service-assistance-copy">{service.assistance}</p>
        </div>
        <aside className="service-enquiry-note">
          <span className="eyebrow">START WITH YOUR REQUIREMENT</span>
          <h3>{service.discussion}</h3>
          <p>
            {service.contactPrompt} Please
            leave out patient records and sensitive medical information.
          </p>
          <Button secondary to="/contact">
            {service.contactLabel}
          </Button>
        </aside>
      </Section>
      <Section className="service-closing">
        <div>
          <p className="eyebrow">LET’S BEGIN A CONVERSATION</p>
          <h2>
            Your requirements.
            <br />A starting point.
          </h2>
          <p>
            Contact Mediastris to discuss the scope relevant to your
            organization.
          </p>
        </div>
        <div>
          <Button to="/contact">Make an enquiry</Button>
          <Link className="text-link" to="/services">
            Explore all services ↗
          </Link>
        </div>
      </Section>
    </>
  );
}
