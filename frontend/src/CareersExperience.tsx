import { useState } from "react";
import { Link } from "react-router-dom";
import { displayJobs, careers, NO_OPENINGS } from "./careers";
import { Button, Meta, Section } from "./components";
import ServiceIcon from "./ServiceIcon";
import CareersApplicationForm from "./CareersApplicationForm";
import { publicAsset } from "./hosting";
const draft = (
  <p className="careers-draft">
    Draft career content for client review · Workplace arrangements and
    opportunities require client confirmation.
  </p>
);
function CareerImage({ growth = false }: { growth?: boolean }) {
  const image = growth ? careers.growthImage : careers.heroImage;
  return (
    <figure className="about-stock careers-photo">
      <img
        src={publicAsset(image.src)}
        alt={image.alt}
        width="1600"
        height="960"
        loading="lazy"
        style={{ objectPosition: image.position }}
      />
      <figcaption>
        Illustrative stock image · Not Mediastris employees or premises
      </figcaption>
    </figure>
  );
}
function Banner({ path }: { path: string }) {
  const page = careers.pages.find((page) => page.path === path)!;
  return (
    <>
      <Meta title={page.title} description={page.description} />
      <section className="about-banner">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/careers">Careers</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{page.label}</span>
        </nav>
        <div className="about-banner-title">
          <div>
            <p className="eyebrow">YOUR NEXT CHAPTER</p>
            <h1>{page.title}</h1>
          </div>
          <p>{page.description}</p>
        </div>
      </section>
    </>
  );
}
function CareerClosing() {
  return (
    <Section className="service-closing">
      <div>
        <p className="eyebrow">EXPLORE WHAT COMES NEXT</p>
        <h2>A thoughtful next step.</h2>
        <p>
          Find approved opportunities and consider how your experience could
          connect.
        </p>
      </div>
      <div>
        <Button to="/careers/openings">Explore Opportunities</Button>
        <Link className="text-link" to="/careers">
          Careers overview ↗
        </Link>
      </div>
    </Section>
  );
}
function CandidateGuide({ application = false }: { application?: boolean }) {
  return (
    <Section className="career-candidate-guide">
      <div>
        <p className="eyebrow">{application ? "BEFORE YOU BEGIN" : "MAKE YOUR NEXT STEP INFORMED"}</p>
        <h2>{application ? "A clear application starts here." : "Bring your experience into focus."}</h2>
        <p>Use these practical steps to decide whether a published opportunity connects with your experience and interests.</p>
      </div>
      <ol>
        <li><h3>Start with an available role</h3><p>Read the responsibilities, required experience and location on Job Openings. Apply only when a suitable approved vacancy is published.</p></li>
        <li><h3>Choose relevant examples</h3><p>Explain the work you contributed to, the problem you helped resolve and what you learned. Keep confidential client and patient information out of your application.</p></li>
        <li><h3>Prepare your details</h3><p>Have your contact details, current location, experience and notice period ready. For an open application, attach a PDF, DOC or DOCX resume up to 5 MB.</p></li>
      </ol>
    </Section>
  );
}
function EmptyOpenings() {
  return (
    <div className="careers-empty">
      <span className="careers-empty-icon">
        <ServiceIcon name="compass" />
      </span>
      <div>
        <p className="eyebrow">CURRENT OPPORTUNITIES</p>
        <h2>Stay open to what’s next.</h2>
        <p>{NO_OPENINGS}</p>
        {careers.generalApplicationsEnabled && (
          <Button secondary to="/careers/apply">
            General Application
          </Button>
        )}
        {!careers.generalApplicationsEnabled && (
          <p>General applications are currently closed. Check this page again for a published role, then review its requirements before applying.</p>
        )}
      </div>
    </div>
  );
}
export function CareersLanding() {
  const page = careers.pages[0];
  return (
    <>
      <Meta title="Careers" description={page.description} />
      <section className="career-hero">
        <img
          src={publicAsset(careers.heroImage.src)}
          alt={careers.heroImage.alt}
          width="1600"
          height="960"
          fetchPriority="high"
        />
        <div className="career-hero-content">
          <p className="eyebrow">CAREERS AT MEDIASTRIS</p>
          <h1>{page.title}</h1>
          <p className="career-hero-description">{careers.introduction}</p>
          <Button to="/careers/openings">Explore Opportunities</Button>
          {draft}
        </div>
        <p className="career-hero-caption">
          Illustrative stock image · Not Mediastris employees
        </p>
      </section>
      <Section className="career-preview">
        <div>
          <p className="eyebrow">01 / WHY MEDIASTRIS</p>
          <h2>
            Your work.
            <br />
            Your perspective.
            <br />
            Your next step.
          </h2>
          <p>
            Explore a professional contribution connected to healthcare,
            thoughtful problem-solving and communication.
          </p>
          {draft}
          <Button secondary to="/careers/why-mediastris">
            Why Mediastris
          </Button>
        </div>
        <CareerImage />
      </Section>
      <Section className="career-preview career-preview-growth">
        <CareerImage growth />
        <div>
          <p className="eyebrow">02 / LEARNING & GROWTH</p>
          <h2>
            Keep your curiosity
            <br />
            moving forward.
          </h2>
          <p>
            Consider the skills, knowledge and ideas you want to develop
            throughout your career.
          </p>
          {draft}
          <Button secondary to="/careers/learning-growth">
            Explore Learning & Growth
          </Button>
        </div>
      </Section>
      <Section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">03 / OPPORTUNITIES</p>
            <h2>Find your starting point.</h2>
          </div>
          <Link className="text-link" to="/careers/openings">
            View job openings ↗
          </Link>
        </div>
        {displayJobs.length ? (
          <div className="career-job-previews">
            {displayJobs.slice(0, 3).map((job) => (
              <Link
                className="career-job-preview"
                key={job.id}
                to={`/careers/openings?position=${job.id}`}
              >
                {job.preview && (
                  <p className="eyebrow">PREVIEW ROLE · CLIENT REVIEW</p>
                )}
                <p className="eyebrow">
                  {job.location} · {job.employmentType}
                </p>
                <h3>{job.title}</h3>
                <span>Explore opportunity ↗</span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyOpenings />
        )}
      </Section>
      <CandidateGuide />
      <CareerClosing />
    </>
  );
}
export function WhyMediastris() {
  return (
    <>
      <Banner path="/careers/why-mediastris" />
      <Section className="career-preview">
        <CareerImage />
        <div>
          <p className="eyebrow">A PROFESSIONAL CONTRIBUTION</p>
          <h2>
            A connection
            <br />
            worth exploring.
          </h2>
          <p>{careers.introduction}</p>
          <p>Think about the kind of healthcare work that interests you and the strengths you would bring to it. The themes below can help you assess a future role and prepare specific questions about its responsibilities.</p>
          {draft}
          <Link className="text-link" to="/careers/openings">Check current opportunities ↗</Link>
        </div>
      </Section>
      <Section className="career-themes">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PERSPECTIVES TO CONSIDER</p>
            <h2>What matters to you?</h2>
          </div>
          <p>
            Draft themes for a conversation,
            <br />
            not confirmed workplace policies.
          </p>
        </div>
        <div className="career-theme-grid">
          {careers.why.map((item, index) => (
            <article key={item.title}>
              <span className="service-icon">
                <ServiceIcon name={item.icon} />
              </span>
              <span className="service-card-number">0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
        {draft}
      </Section>
      <CareerClosing />
    </>
  );
}
export function LearningGrowth() {
  return (
    <>
      <Banner path="/careers/learning-growth" />
      <Section className="career-preview">
        <div>
          <p className="eyebrow">A JOURNEY OF DEVELOPMENT</p>
          <h2>
            Room to learn.
            <br />
            Space to contribute.
          </h2>
          <p>
            Professional growth can begin with curiosity, reflection and a
            willingness to explore new perspectives.
          </p>
          <p>Start by identifying a skill you want to strengthen, a recent challenge you learned from and a practical next step. Use these reflections when reviewing future role requirements; training programmes and progression arrangements will need individual confirmation.</p>
          {draft}
          <Link className="text-link" to="/careers/why-mediastris">Explore professional work themes ↗</Link>
        </div>
        <CareerImage growth />
      </Section>
      <Section className="career-learning">
        <div className="career-learning-intro">
          <p className="eyebrow">DEVELOPING YOUR PERSPECTIVE</p>
          <h2>
            Keep learning
            <br />
            part of the journey.
          </h2>
          <p>
            These aspirational themes await client approval. Specific
            programmes, training arrangements and progression paths are not
            confirmed.
          </p>
        </div>
        <ol>
          {careers.growth.map((item, index) => (
            <li key={item.title}>
              <span className="service-card-number">0{index + 1}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
              <span className="service-icon">
                <ServiceIcon name={item.icon} />
              </span>
            </li>
          ))}
        </ol>
      </Section>
      <CareerClosing />
    </>
  );
}
export function JobOpenings() {
  const params = new URLSearchParams(location.search);
  const [selected, setSelected] = useState(
    params.get("position") || displayJobs[0]?.id || "",
  );
  const [filter, setFilter] = useState("");
  const matches = displayJobs.filter((job) =>
    job.title.toLowerCase().includes(filter.toLowerCase()),
  );
  const job = matches.find((job) => job.id === selected) || matches[0];
  return (
    <>
      <Banner path="/careers/openings" />
      <Section className="openings-section">
        {displayJobs.some((job) => job.preview) && (
          <div className="preview-roles-notice">
            <p className="eyebrow">LOCAL DEVELOPMENT PREVIEW</p>
            <h2>Preview roles · Not confirmed vacancies</h2>
            <p>
              Six sample positions for design review. Titles, locations and
              requirements are illustrative. Preview applications do not send
              email.
            </p>
          </div>
        )}
        {!displayJobs.length ? (
          <EmptyOpenings />
        ) : (
          <>
            <div className="openings-filter">
              <label htmlFor="job-filter">Find a job title</label>
              <input
                id="job-filter"
                type="search"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                placeholder="Search approved opportunities"
              />
            </div>
            <div className="openings-layout">
              <div className="job-selector" aria-label="Available positions">
                {matches.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={job?.id === item.id}
                    onClick={() => setSelected(item.id)}
                  >
                    <span className="eyebrow">{item.location}</span>
                    <span>{item.title}</span>
                    <span>
                      {item.employmentType} <span aria-hidden="true">↗</span>
                    </span>
                  </button>
                ))}
              </div>
              {job ? (
                <article className="job-details" aria-live="polite">
                  <p className="eyebrow">
                    {job.preview
                      ? "PREVIEW ROLE · CLIENT REVIEW"
                      : "CURRENT OPPORTUNITY"}
                  </p>
                  <h2>{job.title}</h2>
                  <dl>
                    <div>
                      <dt>Location</dt>
                      <dd>{job.location}</dd>
                    </div>
                    <div>
                      <dt>Employment type</dt>
                      <dd>{job.employmentType}</dd>
                    </div>
                    <div>
                      <dt>Experience</dt>
                      <dd>{job.experience}</dd>
                    </div>
                  </dl>
                  <h3>Responsibilities</h3>
                  <ul>
                    {job.responsibilities.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <h3>Qualifications</h3>
                  <ul>
                    {job.qualifications.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <Button to={`/careers/apply?position=${job.id}`}>
                    {job.preview ? "Preview application" : "Apply Now"}
                  </Button>
                </article>
              ) : (
                <div className="application-closed">
                  <h2>No matching job titles.</h2>
                  <p>Try another search or clear the filter.</p>
                </div>
              )}
            </div>
          </>
        )}
        {careers.generalApplicationsEnabled && displayJobs.length > 0 && (
          <p className="general-application-link">
            <Link className="text-link" to="/careers/apply">
              General Application ↗
            </Link>
          </p>
        )}
      </Section>
      <CareerClosing />
    </>
  );
}
export function ApplicationPage() {
  return (
    <>
      <Meta
        title="Job Application"
        description="Apply for a verified Mediastris Healthcare LLP vacancy when applications are open."
      />
      <section className="about-banner">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/careers">Careers</Link>
          <span aria-hidden="true">/</span>
          <Link to="/careers/openings">Job Openings</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Application</span>
        </nav>
        <div className="about-banner-title">
          <div>
            <p className="eyebrow">TAKE THE NEXT STEP</p>
            <h1>Your Application</h1>
          </div>
          <p>Review application availability, prepare your details and take the next step when a suitable role is open.</p>
        </div>
      </section>
      <Section className="application-section">
        <CareersApplicationForm />
      </Section>
      <CandidateGuide application />
    </>
  );
}
