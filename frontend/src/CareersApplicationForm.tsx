import { useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { displayJobs, careers } from "./careers";
import { Link } from "react-router-dom";
import { Button } from "./components";
import { apiAvailable, apiUrl } from "./hosting";
type Fields = {
  fullName: string;
  email: string;
  phone: string;
  position: string;
  currentLocation: string;
  totalExperience: string;
  noticePeriod: string;
  currentCtc: string;
  expectedCtc: string;
  coverMessage: string;
};
const blank: Fields = {
  fullName: "",
  email: "",
  phone: "",
  position: "",
  currentLocation: "",
  totalExperience: "",
  noticePeriod: "",
  currentCtc: "",
  expectedCtc: "",
  coverMessage: "",
};
export default function CareersApplicationForm() {
  const [params] = useSearchParams();
  const [values, setValues] = useState<Fields>({
    ...blank,
    position: displayJobs.some((job) => job.id === params.get("position"))
      ? params.get("position")!
      : "",
  });
  const [resume, setResume] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState("");
  const busy = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  const replay = useRef({ fingerprint: "", key: "" });
  const preview = displayJobs.some(
    (job) => job.id === values.position && job.preview,
  );
  const requestedPosition = params.get("position");
  const unavailablePosition = !!requestedPosition &&
    !displayJobs.some((job) => job.id === requestedPosition) &&
    !(requestedPosition === "general" && careers.generalApplicationsEnabled);
  if (unavailablePosition && displayJobs.length)
    return (
      <div className="application-closed">
        <p className="eyebrow">POSITION UNAVAILABLE</p>
        <h2>This position is not accepting applications.</h2>
        <p>The application link may be out of date. Review the current openings and select an available role before sharing your details.</p>
        <Button secondary to="/careers/openings">View job openings</Button>
      </div>
    );
  if (!displayJobs.length && !careers.generalApplicationsEnabled)
    return (
      <div className="application-closed">
        <p className="eyebrow">APPLICATION STATUS</p>
        <h2>Applications are not open yet.</h2>
        <p>
          We currently have no approved vacancies accepting applications.
          General applications are also closed, so there is no resume upload
          or application submission available at this time.
        </p>
        <h3>How to prepare for a future opening</h3>
        <ul>
          <li>Return to Job Openings to check for a published role.</li>
          <li>Read its responsibilities, location and requirements before applying.</li>
          <li>Keep an updated resume and a brief summary of relevant experience ready.</li>
        </ul>
        <Button secondary to="/careers/openings">
          View job openings
        </Button>
        <p className="application-related"><Link className="text-link" to="/careers/learning-growth">Explore learning & growth ↗</Link></p>
      </div>
    );
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy.current || sent || (!apiAvailable && !preview)) return;
    const data = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, value.trim()]),
    ) as Fields;
    const found: Record<string, string> = {};
    if (
      data.fullName.length < 2 ||
      data.fullName.length > 100 ||
      /[\r\n]/.test(data.fullName)
    )
      found.fullName = "Enter your full name.";
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ||
      data.email.length > 254
    )
      found.email = "Enter a valid email address.";
    if (
      !/^\+?[\d ()-]{7,24}$/.test(data.phone) ||
      data.phone.replace(/\D/g, "").length < 7 ||
      data.phone.replace(/\D/g, "").length > 15
    )
      found.phone = "Enter a valid phone number.";
    if (
      !displayJobs.some((job) => job.id === data.position) &&
      !(data.position === "general" && careers.generalApplicationsEnabled)
    )
      found.position = "Select an available position.";
    for (const key of [
      "currentLocation",
      "totalExperience",
      "noticePeriod",
    ] as const)
      if (
        !data[key] ||
        data[key].length > (key === "currentLocation" ? 160 : 60)
      )
        found[key] = "Please complete this field within the character limit.";
    for (const key of ["currentCtc", "expectedCtc"] as const)
      if (data[key].length > 80) found[key] = "Use up to 80 characters.";
    if (data.coverMessage.length > 4000)
      found.coverMessage = "Use up to 4,000 characters.";
    if (
      !resume ||
      resume.size === 0 ||
      resume.size > 5 * 1024 * 1024 ||
      !/\.(pdf|doc|docx)$/i.test(resume.name)
    )
      found.resume = "Upload a PDF, DOC or DOCX file up to 5 MB.";
    setErrors(found);
    setStatus("");
    if (Object.keys(found).length) {
      requestAnimationFrame(() =>
        form.current
          ?.querySelector<HTMLElement>("[aria-invalid=true]")
          ?.focus(),
      );
      return;
    }
    busy.current = true;
    setPending(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      if (preview) {
        setSent(true);
        setStatus("Preview only — no application was sent or stored.");
        return;
      }
      const digest = Array.from(
        new Uint8Array(
          await crypto.subtle.digest("SHA-256", await resume!.arrayBuffer()),
        ),
      )
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("");
      const fingerprint = JSON.stringify(data) + digest;
      if (replay.current.fingerprint !== fingerprint)
        replay.current = { fingerprint, key: crypto.randomUUID() };
      const body = new FormData();
      for (const [key, value] of Object.entries(data)) body.append(key, value);
      body.append("resume", resume!);
      const response = await fetch(apiUrl("/api/careers/apply"), {
        method: "POST",
        headers: { "Idempotency-Key": replay.current.key },
        body,
        signal: controller.signal,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        if (result?.fields) setErrors(result.fields);
        setStatus(
          response.status === 429
            ? "Too many application attempts. Please try again later."
            : response.status === 413
              ? "The resume is too large. Upload a file up to 5 MB."
              : response.status === 400
                ? "Please check your application details and resume."
                : response.status === 409
                  ? "This application is still being processed. Please wait before retrying."
                  : response.status === 422
                    ? "This position is not accepting applications. Please check current openings."
                    : "We could not confirm your application email. Please retry later with the same details.",
        );
        return;
      }
      if (result?.email !== "accepted") {
        setStatus(
          "We could not confirm your application email. Please retry later with the same details.",
        );
        return;
      }
      setSent(true);
      setStatus(
        "Your application email was accepted by our email service. Inbox delivery is not yet confirmed.",
      );
    } catch {
      setStatus(
        "We could not confirm your application email. Check your connection and retry with the same details.",
      );
    } finally {
      clearTimeout(timeout);
      busy.current = false;
      setPending(false);
    }
  }
  const field = (
    name: keyof Fields,
    label: string,
    required = true,
    maxLength = 160,
    type = "text",
  ) => (
    <div className={`field ${name === "coverMessage" ? "full" : ""}`}>
      <label htmlFor={`application-${name}`}>
        {label}
        {required ? " *" : " (optional)"}
      </label>
      <input
        id={`application-${name}`}
        name={name}
        type={type}
        value={values[name]}
        maxLength={maxLength}
        required={required}
        autoComplete={
          name === "fullName"
            ? "name"
            : name === "email"
              ? "email"
              : name === "phone"
                ? "tel"
                : name === "currentLocation"
                  ? "address-level2"
                  : "off"
        }
        onChange={(event) =>
          setValues({ ...values, [name]: event.target.value })
        }
        aria-invalid={!!errors[name]}
        aria-describedby={
          errors[name] ? `application-${name}-error` : undefined
        }
      />
      {errors[name] && (
        <span className="field-error" id={`application-${name}-error`}>
          {errors[name]}
        </span>
      )}
    </div>
  );
  return (
    <form
      ref={form}
      className="careers-application-form"
      onSubmit={submit}
      noValidate
      aria-busy={pending}
    >
      <p className="eyebrow">YOUR APPLICATION</p>
      <h2>Tell us about yourself.</h2>
      {preview && (
        <p className="preview-roles-notice">
          Sample role — this preview does not send or store applications.
        </p>
      )}
      <p className="form-note">
        Fields marked * are required.{" "}
        {preview
          ? "Use sample details to explore this application form."
          : "Your details and resume will be emailed to the configured careers mailbox."}
      </p>
      {!preview && displayJobs.length > 0 && displayJobs.every((job) => job.preview) && (
        <p className="preview-roles-notice">Local design preview only. Select a sample role and use fictional details; this form does not send or store applications.</p>
      )}
      <fieldset disabled={pending || sent}>
        <legend className="sr-only">Application details</legend>
        <div className="form-grid">
          {field("fullName", "Full Name", true, 100)}
          {field("email", "Email Address", true, 254, "email")}
          {field("phone", "Phone Number", true, 24, "tel")}
          <div className="field">
            <label htmlFor="application-position">Position Applied For *</label>
            <select
              id="application-position"
              required
              value={values.position}
              onChange={(event) =>
                setValues({ ...values, position: event.target.value })
              }
              aria-invalid={!!errors.position}
              aria-describedby={
                errors.position ? "application-position-error" : undefined
              }
            >
              <option value="">Select a position</option>
              {displayJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                  {job.preview ? " (Preview)" : ""}
                </option>
              ))}
              {careers.generalApplicationsEnabled && (
                <option value="general">General Application</option>
              )}
            </select>
            {errors.position && (
              <span className="field-error" id="application-position-error">
                {errors.position}
              </span>
            )}
          </div>
          {field("currentLocation", "Current Location")}
          {field("totalExperience", "Total Experience", true, 60)}
          {field("noticePeriod", "Notice Period", true, 60)}
          {field("currentCtc", "Current CTC", false, 80)}
          {field("expectedCtc", "Expected CTC", false, 80)}
          <div className="field full">
            <label htmlFor="application-coverMessage">
              Cover Message (optional)
            </label>
            <textarea
              id="application-coverMessage"
              value={values.coverMessage}
              maxLength={4000}
              rows={5}
              onChange={(event) =>
                setValues({ ...values, coverMessage: event.target.value })
              }
              aria-invalid={!!errors.coverMessage}
              aria-describedby={
                errors.coverMessage
                  ? "application-coverMessage-error"
                  : undefined
              }
            />
            {errors.coverMessage && (
              <span className="field-error" id="application-coverMessage-error">
                {errors.coverMessage}
              </span>
            )}
          </div>
          <div className="field full resume-field">
            <label htmlFor="application-resume">Resume Upload *</label>
            <input
              id="application-resume"
              name="resume"
              type="file"
              required
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(event) => setResume(event.target.files?.[0] || null)}
              aria-invalid={!!errors.resume}
              aria-describedby={`resume-help ${errors.resume ? "application-resume-error" : ""}`}
            />
            <p id="resume-help">
              PDF, DOC or DOCX · Maximum 5 MB · No password protection, macros
              or embedded files.
            </p>
            {errors.resume && (
              <span className="field-error" id="application-resume-error">
                {errors.resume}
              </span>
            )}
          </div>
        </div>
      </fieldset>
      <p className="form-note">
        Please do not include patient information or sensitive medical records
        in your application.
      </p>
      {!apiAvailable && !preview && <p className="form-note" role="status">Applications are unavailable in this preview. No application or resume will be sent or stored.</p>}
      <button type="submit" className="button" disabled={pending || sent || (!apiAvailable && !preview)}>
        {pending
          ? "Submitting application…"
          : sent
            ? preview
              ? "Preview complete"
              : "Application submitted"
            : preview
              ? "Preview application"
              : "Submit application"}{" "}
        <span aria-hidden="true">↗</span>
      </button>
      <div
        className={`form-status ${sent ? "success" : ""}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {status}
      </div>
    </form>
  );
}
