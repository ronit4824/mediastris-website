import { Link, Route, Routes, useParams } from "react-router-dom";
import {
  Button,
  Card,
  CTA,
  EmptyState,
  Layout,
  Meta,
  PageIntro,
  Section,
} from "./components";
import { contact, content, images, maps, site } from "./content";
import ContactForm from "./ContactForm";
import { publicAsset } from "./hosting";
import ReviewsSection from "./ReviewsSection";
import {
  CareersLanding,
  WhyMediastris,
  LearningGrowth,
  JobOpenings,
  ApplicationPage,
} from "./CareersExperience";
import { ServiceCatalogue, ServiceDetail } from "./ServiceExperience";
import {
  AboutOverview,
  VisionPage,
  ManagementPage,
  CeoMessagePage,
} from "./AboutExperience";
function StockImage({
  kind,
  className = "",
  eager = false,
}: {
  kind: keyof typeof images;
  className?: string;
  eager?: boolean;
}) {
  const img = images[kind];
  return (
    <figure className={`stock-image ${className}`}>
      <img
        src={publicAsset(img.src)}
        alt={img.alt}
        width={kind === "hero" ? 1400 : 1000}
        height={kind === "hero" ? 1400 : 750}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
      />
      <figcaption>
        Illustrative stock image · Not Mediastris personnel or premises
      </figcaption>
    </figure>
  );
}
function Home() {
  return (
    <>
      <Meta
        title="Home"
        description="Discover Mediastris Healthcare LLP. Explore company information, healthcare services, insights and contact our Mumbai office."
      />
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="small-line" /> MEDIASTRIS HEALTHCARE LLP
          </p>
          <h1>
            Healthcare.
            <br />A broader
            <br />
            <em>perspective.</em>
          </h1>
          <p className="hero-description">
            {site.home.heroDescription}
          </p>
          <div className="hero-actions">
            <Button to="/contact">Let’s start a conversation</Button>
            <Link className="text-link" to="/about">
              Meet Mediastris <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="hero-bottom">
            <span>MUMBAI, INDIA</span>
            <a href="#introduction">
              Explore below <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
        <div className="hero-visual">
          <StockImage kind="hero" eager />
          <span className="image-index" aria-hidden="true">
            01 / HEALTHCARE
          </span>
          <div className="hero-image-label">
            <span className="eyebrow">A PLACE TO CONNECT</span>
            <p>
              People.
              <br />
              Perspectives.
              <br />
              Possibilities.
            </p>
          </div>
        </div>
      </section>
      <div className="topic-strip" aria-label="Explore Mediastris">
        <span>GET TO KNOW US</span>
        <Link to="/about">Our company ↗</Link>
        <Link to="/services">Our services ↗</Link>
        <Link to="/insights">Our perspectives ↗</Link>
      </div>
      <Section id="introduction" className="introduction">
        <p className="eyebrow">01 / INTRODUCING MEDIASTRIS</p>
        <div>
          <h2>
            A closer look
            <br />
            at Mediastris.
          </h2>
          <p className="large-copy">
            {site.home.introduction}
          </p>
          <p className="draft-copy-note">{site.draftNotice}</p>
          <Link className="text-link" to="/about">
            Get to know us ↗
          </Link>
        </div>
      </Section>
      <Section className="services-section" id="services">
        <div className="section-heading">
          <div>
            <p className="eyebrow">02 / OUR SERVICES</p>
            <h2>Explore our capabilities.</h2>
            <p className="services-introduction">
              Find a starting point for your organization, from operational
              questions to brand communication.
            </p>
          </div>
          <Link className="text-link" to="/services">
            View all services ↗
          </Link>
        </div>
        <ServiceCatalogue />
      </Section>
      <Section className="split-section">
        <StockImage kind="collaboration" />
        <div>
          <p className="eyebrow">03 / OUR PERSPECTIVE</p>
          <h2>
            The people and
            <br />
            thinking behind
            <br />
            the company.
          </h2>
          <p>
            {site.home.capabilitiesIntroduction}
          </p>
          <ol className="capability-list">
            {site.home.capabilities.map((item) => <li key={item.title}><h3>{item.title}</h3><p>{item.text}</p></li>)}
          </ol>
          <Button secondary to="/about">
            About Mediastris
          </Button>
        </div>
      </Section>
      <Section className="work-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">04 / CASE STUDIES</p>
            <h2>Work, in perspective.</h2>
            <p className="services-introduction">Explore the questions a project review can address. Approved client stories will appear here when publication is authorized.</p>
          </div>
          <Link className="text-link" to="/case-studies">
            Explore case studies ↗
          </Link>
        </div>
        {content.caseStudies.length ? (
          <div className="service-grid">
            {content.caseStudies.slice(0, 2).map((c) => (
              <Card key={c.slug}>
                {c.preview && <span className="preview-pill">Illustrative scenario · Preview only</span>}
                <h3>{c.title}</h3>
                <p>{c.summary}</p>
                <Button secondary to={`/case-studies/${c.slug}`}>
                  Read case study
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            category="OUR WORK"
            title="Stories will appear here."
            text="Case studies will be published when approved project details and outcomes are available."
          />
        )}
      </Section>
      <Section className="contact-highlight">
        <p className="eyebrow">BASED IN MUMBAI</p>
        <h2>
          Find us in
          <br />
          Borivali West.
        </h2>
        <div>
          <address>{content.address}</address>
          <Link className="text-link" to="/contact">
            Contact & directions ↗
          </Link>
        </div>
      </Section>
      <CTA />
      <ReviewsSection />
    </>
  );
}
function Services() {
  return (
    <>
      <Meta
        title="Services"
        description="Explore eight provisional service areas at Mediastris Healthcare LLP. Service names and draft descriptions are pending client verification."
      />
      <PageIntro
        eyebrow="SERVICES"
        title="Start with your requirements."
        description="Eight starting points for a conversation. Explore our provisional service portfolio and discuss your organization’s requirements."
      />
      <Section className="services-index">
        <ServiceCatalogue />
      </Section>
      <CTA />
    </>
  );
}
function Cases() {
  return (
    <>
      <Meta
        title="Case studies"
        description="Explore illustrative project-planning scenarios in local preview. Approved Mediastris client stories will be published with permission."
      />
      <PageIntro
        eyebrow="CASE STUDIES"
        title="The detail behind the work."
        description="Understand the questions behind a healthcare project review. Client stories are published only after the organization approves their content and disclosure."
      />
      <Section>
        {content.caseStudies.some(c => c.preview) && <p className="content-notice">Local design preview: these are hypothetical planning scenarios, not Mediastris engagements. No actual client, measured result or outcome is represented.</p>}
        {content.caseStudies.length ? (
          <div className="service-grid">
            {content.caseStudies.map((c) => (
              <Card key={c.slug}>
                {c.preview && <span className="preview-pill">Illustrative scenario · Preview only</span>}
                <h2>{c.title}</h2>
                <p>{c.summary}</p>
                <Button secondary to={`/case-studies/${c.slug}`}>
                  Read case study
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            category="PROJECT STORIES"
            title="Case studies are on their way."
            text="No approved case studies are currently available. Project stories will be shared after client review and permission."
          />
        )}
      </Section>
      <CTA />
    </>
  );
}
function Insights() {
  return (
    <>
      <Meta
        title="Insights"
        description="Draft reading on healthcare documentation, administrative coordination and insurance desk discussions. Editorial approval is pending."
      />
      <PageIntro
        eyebrow="INSIGHTS"
        title="Room for a fresh perspective."
        description="Practical questions for healthcare administration, documentation and coordination. These original draft articles are offered for editorial review, with no medical or regulatory advice."
      />
      <Section>
        {content.articles.length ? (
          <div className="service-grid">
            {content.articles.map((a) => (
              <Card key={a.slug}>
                <span className="preview-pill">Draft article · Client review</span>
                <p className="article-date">Draft prepared <time dateTime={a.date}>{new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(a.date))}</time></p>
                <h2>{a.title}</h2>
                <p>{a.summary}</p>
                <Button secondary to={`/insights/${a.slug}`}>
                  Read article
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            category="ARTICLES & UPDATES"
            title="The next perspective is taking shape."
            text="No articles have been approved for publication yet. Visit again for future insights and company updates."
          />
        )}
      </Section>
      <CTA />
    </>
  );
}
function Contact() {
  return (
    <>
      <Meta
        title="Contact us"
        description="Contact Mediastris Healthcare LLP at The Orion Business Park, Borivali West, Mumbai. Send an enquiry or find directions."
      />
      <PageIntro
        eyebrow="CONTACT US"
        title="Let’s begin a conversation."
        description="Tell us about your organization, the service area you would like to discuss and the questions you need help clarifying. Use the form below or explore directions to our Mumbai office."
      />
      <Section className="contact-grid">
        <div className="contact-details">
          <p className="eyebrow">GET IN TOUCH</p>
          <h2>
            We’d like to
            <br />
            hear from you.
          </h2>
          <div>
            <h3>Our office</h3>
            <address>{content.address}</address>
            <p className="office-note">The office is listed at The Orion Business Park, near Shimpoli Signal in Borivali West. Please confirm a visit before travelling.</p>
            <a
              className="text-link"
              href={maps.directions}
              target="_blank"
              rel="noreferrer"
            >
              Get directions ↗
            </a>
          </div>
          <div>
            <h3>{contact.email || contact.phone ? "Email & phone" : "Send an enquiry"}</h3>
            {contact.email ? (
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            ) : (
              <p>Use the enquiry form to introduce your organization and the topic you would like to discuss.</p>
            )}
            {contact.phone ? (
              <a href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}>
                {contact.phone}
              </a>
            ) : null}
            {!contact.email && !contact.phone && <p className="office-note">Direct company contact details will be added after verification. This preview does not guarantee message delivery while email setup is pending.</p>}
          </div>
        </div>
        <ContactForm />
      </Section>
      <Section className="map-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">VISIT OUR OFFICE</p>
            <h2>Borivali West, Mumbai.</h2>
          </div>
          <a
            className="text-link"
            href={maps.directions}
            target="_blank"
            rel="noreferrer"
          >
            Open Google Maps ↗
          </a>
        </div>
        <iframe
          title="Google Maps address search for Mediastris office in Borivali West"
          src={maps.embed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <p className="map-note">
          Address-based Google Maps search. Please confirm the exact building
          pin before visiting.
        </p>
      </Section>
    </>
  );
}
function ServicePage() {
  const { slug } = useParams();
  const service = content.services.find((item) => item.slug === slug);
  return service ? <ServiceDetail service={service} /> : <NotFound />;
}
function Detail({ type }: { type: "case-studies" | "insights" }) {
  const { slug } = useParams();
  const item =
    type === "case-studies"
      ? content.caseStudies.find((s) => s.slug === slug)
      : content.articles.find((s) => s.slug === slug);
  if (!item) return <NotFound />;
  return (
    <>
      <Meta title={item.title} description={item.summary} />
      <PageIntro
        eyebrow={type.replace("-", " ")}
        title={item.title}
        description={item.summary}
      />
      <Section className="detail-content">
        {"challenge" in item ? (
          <>
            <div className="demo-badge-bar">
              <span className="demo-badge">{item.preview ? "Illustrative scenario · Preview only" : "Case study"}</span>
              <span className="demo-badge-note">
                {item.preview ? "Hypothetical planning example. No real Mediastris project or measured result is claimed." : "Project details published with client approval."}
              </span>
            </div>
            {[
              [item.preview ? "Scenario" : "Challenge", item.challenge],
              [item.preview ? "Proposed approach" : "Solution", item.solution],
              [item.preview ? "What to assess" : "Outcome", item.outcome],
            ].map(([h, p]) => (
              <div key={h}>
                <h2>{h}</h2>
                <p>{p}</p>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="demo-badge-bar">
              <span className="demo-badge">Draft article · Client review</span>
              <span className="demo-badge-note">
                General administrative discussion only. Editorial approval pending; not medical, legal or regulatory advice.
              </span>
            </div>
            <p className="detail-meta">
              {item.author} · Draft prepared <time dateTime={item.date}>{new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(item.date))}</time>
            </p>
            {item.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </>
        )}
        <Button secondary to={`/${type}`}>
          Back to {type.replace("-", " ")}
        </Button>
      </Section>
      <CTA />
    </>
  );
}
function NotFound() {
  return (
    <>
      <Meta
        title="Page not found"
        description="This page could not be found. Return to Mediastris Healthcare LLP."
      />
      <PageIntro
        eyebrow="404"
        title="A different direction."
        description="The page you’re looking for isn’t available."
      />
      <Section>
        <Button to="/">Back to home</Button>
      </Section>
    </>
  );
}
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<AboutOverview />} />
        <Route path="about-us" element={<AboutOverview />} />
        <Route path="about-us/vision" element={<VisionPage />} />
        <Route path="about-us/management" element={<ManagementPage />} />
        <Route path="about-us/ceo-message" element={<CeoMessagePage />} />
        <Route path="services" element={<Services />} />
        <Route path="services/:slug" element={<ServicePage />} />
        <Route path="case-studies" element={<Cases />} />
        <Route
          path="case-studies/:slug"
          element={<Detail type="case-studies" />}
        />
        <Route path="insights" element={<Insights />} />
        <Route path="insights/:slug" element={<Detail type="insights" />} />
        <Route path="blogs" element={<Insights />} />
        <Route path="careers" element={<CareersLanding />} />
        <Route path="careers/why-mediastris" element={<WhyMediastris />} />
        <Route path="careers/learning-growth" element={<LearningGrowth />} />
        <Route path="careers/openings" element={<JobOpenings />} />
        <Route path="careers/apply" element={<ApplicationPage />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
