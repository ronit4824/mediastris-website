import { Link } from "react-router-dom";
import { about, aboutPage, type AboutImage, type AboutPageId } from "./about";
import { Button, CTA, Meta, Section } from "./components";
import ServiceIcon from "./ServiceIcon";
import { publicAsset } from "./hosting";

function Paragraphs({ items, label }: { items: string[]; label: string }) {
  return items.length ? (
    <div className="about-paragraphs">
      {items.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  ) : (
    <div className="about-content-pending">
      <p className="eyebrow">{label}</p>
      <p>{about.fallbackText}</p>
    </div>
  );
}
function AboutStock({
  image,
  className = "",
}: {
  image: AboutImage;
  className?: string;
}) {
  return (
    <figure className={`about-stock ${className}`}>
      <img
        src={publicAsset(image.src)}
        alt={image.alt}
        width="1600"
        height="960"
        loading="lazy"
        style={{ objectPosition: image.position }}
      />
      <figcaption>
        Illustrative stock image · Not Mediastris personnel or premises
      </figcaption>
    </figure>
  );
}
function AboutBanner({ id }: { id: AboutPageId }) {
  const page = aboutPage(id);
  return (
    <section className="about-banner">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        {id !== "overview" && (
          <>
            <Link to="/about-us">About us</Link>
            <span aria-hidden="true">/</span>
          </>
        )}
        <span aria-current="page">{page.label}</span>
      </nav>
      <div className="about-banner-title">
        <div>
          <p className="eyebrow">MEDIASTRIS HEALTHCARE LLP</p>
          <h1>{page.title}</h1>
        </div>
        <p>{page.description}</p>
      </div>
    </section>
  );
}
function AboutMeta({ id }: { id: AboutPageId }) {
  const page = aboutPage(id);
  return <Meta title={page.title} description={page.description} />;
}

export function AboutOverview() {
  const values = about.values.length
    ? about.values
    : [{ id: "values-pending", ...about.valuesFallback }];
  return (
    <>
      <AboutMeta id="overview" />
      <AboutBanner id="overview" />
      <Section className="about-introduction about-entrance">
        <AboutStock image={about.company.primaryImage} />
        <div>
          <p className="eyebrow">01 / OUR COMPANY</p>
          <h2>
            A closer look
            <br />
            at Mediastris.
          </h2>
          <Paragraphs
            items={about.company.introduction}
            label="COMPANY INTRODUCTION"
          />
          <Link className="text-link" to="/about-us/vision">
            Explore our vision ↗
          </Link>
        </div>
      </Section>
      <Section className="about-values">
        <div className="section-heading">
          <div>
            <p className="eyebrow">02 / WHAT GUIDES US</p>
            <h2>Our Values</h2>
          </div>
          {about.values.length > 0 && about.valuesNote && <p>{about.valuesNote}</p>}
          {!about.values.length && (
            <p>{about.valuesFallback.description}</p>
          )}
        </div>
        <ol className="about-values-grid">
          {values.map((value, index) => (
            <li className="about-value-block" key={value.id}>
              <span className="about-value-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </li>
          ))}
        </ol>
      </Section>
      <Section className="about-story">
        <div>
          <p className="eyebrow">03 / OUR PERSPECTIVE</p>
          <h2>{about.company.storyHeading || "The story behind the name."}</h2>
          <Paragraphs
            items={about.company.story}
            label="COMPANY STORY & APPROACH"
          />
          <Button secondary to="/about-us/management">
            Our leadership
          </Button>
        </div>
        <AboutStock image={about.company.supportingImage} />
      </Section>
      <CTA />
    </>
  );
}

export function VisionPage() {
  const page = aboutPage("vision");
  return (
    <>
      <AboutMeta id="vision" />
      <section className="vision-hero">
        <img
          className="vision-background"
          src={publicAsset(about.vision.image.src)}
          alt={about.vision.image.alt}
          width="1600"
          height="960"
          fetchPriority="high"
          style={{ objectPosition: about.vision.image.position }}
        />
        <div className="vision-layout about-entrance">
          <div className="vision-heading">
            <nav className="service-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <Link to="/about-us">About us</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Vision</span>
            </nav>
            <p className="eyebrow">OUR DIRECTION</p>
            <h1>{page.title}</h1>
            <p>{about.vision.summary}</p>
          </div>
          <div className="vision-content">
            <span className="vision-icon">
              <ServiceIcon name="compass" />
            </span>
            <p className="eyebrow">THE COMPANY VISION</p>
            <Paragraphs
              items={about.vision.paragraphs}
              label="VISION STATEMENT"
            />
            <Link className="text-link" to="/contact">
              Connect with Mediastris ↗
            </Link>
          </div>
        </div>
        <p className="vision-image-label">
          Illustrative stock image · Not Mediastris equipment or premises
        </p>
      </section>
      <Section className="about-mission">
        <p className="eyebrow">OUR PURPOSE</p>
        <h2>Our Mission</h2>
        <Paragraphs
          items={about.mission.paragraphs}
          label="MISSION STATEMENT"
        />
      </Section>
      <CTA />
    </>
  );
}

export function ManagementPage() {
  return (
    <>
      <AboutMeta id="management" />
      <AboutBanner id="management" />
      <Section className="leadership-section about-entrance">
        <div className="leadership-section-heading">
          <p className="eyebrow">THE PEOPLE BEHIND THE COMPANY</p>
          <h2>Leadership, in focus.</h2>
          {about.leadership.introduction.length > 0 && (
            <Paragraphs
              items={about.leadership.introduction}
              label="LEADERSHIP INTRODUCTION"
            />
          )}
        </div>
        {about.leadership.members.length ? (
          <div className="leadership-grid">
            {about.leadership.members.map((member) => (
              <article
                key={member.id}
                className={`leadership-member ${member.featured ? "featured" : ""}`}
              >
                {member.photo ? (
                  <img
                    src={publicAsset(member.photo.src)}
                    alt={member.photo.alt}
                    width="600"
                    height="750"
                    loading="lazy"
                    style={{ objectPosition: member.photo.position }}
                  />
                ) : (
                  <PortraitPending />
                )}
                <div>
                  <p className="eyebrow">{member.designation}</p>
                  <h3>{member.name}</h3>
                  <Paragraphs
                    items={member.biography}
                    label="APPROVED BIOGRAPHY"
                  />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="leadership-awaiting">
            <div className="leadership-line-art" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div>
              <p className="eyebrow">MANAGEMENT TEAM</p>
              <h3>{about.leadership.emptyHeading}</h3>
              <p>{about.leadership.emptyText}</p>
              <Button secondary to="/contact">
                Contact us
              </Button>
            </div>
          </div>
        )}
      </Section>
      <CTA />
    </>
  );
}

function PortraitPending() {
  return (
    <div className="portrait-pending">
      <svg viewBox="0 0 200 240" fill="none" aria-hidden="true">
        <circle cx="100" cy="78" r="36" />
        <path d="M32 215v-22a68 68 0 0 1 136 0v22M16 16h36m96 0h36M16 16v36m168-36v36M16 224h36m96 0h36" />
      </svg>
      <span className="eyebrow">PORTRAIT PLACEHOLDER</span>
      <p>Approved portrait pending</p>
    </div>
  );
}
export function CeoMessagePage() {
  const ceo = about.ceo;
  return (
    <>
      <AboutMeta id="ceo" />
      <AboutBanner id="ceo" />
      <Section className="leadership-message-section about-entrance">
        <article
          className={`leadership-message ${ceo.portrait ? "" : "without-portrait"}`}
        >
          {ceo.portrait && (
            <div className="leadership-portrait">
              <img
                src={publicAsset(ceo.portrait.src)}
                alt={ceo.portrait.alt}
                width="600"
                height="750"
                style={{ objectPosition: ceo.portrait.position }}
              />
            </div>
          )}
          <div className="leadership-message-content">
            <p className="eyebrow">CEO SPEAKS</p>
            <h2>{ceo.heading || "A message, in their own words."}</h2>
            <Paragraphs
              items={ceo.paragraphs}
              label="LEADERSHIP PERSPECTIVE"
            />
            {ceo.name && (
              <div className="leadership-signature">
                <p>{ceo.name}</p>
                {ceo.designation && <span>{ceo.designation}</span>}
              </div>
            )}
            <p className="leadership-message-note">{ceo.note}</p>
          </div>
        </article>
      </Section>
      <CTA />
    </>
  );
}
