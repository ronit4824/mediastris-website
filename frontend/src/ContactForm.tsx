import { useRef, useState, type FormEvent } from "react";
import { content } from "./content";
import { apiAvailable, apiUrl } from "./hosting";
type Fields = {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  message: string;
};
const blank: Fields = {
  name: "",
  email: "",
  phone: "",
  company: "",
  service: "",
  message: "",
};
export function validate(data: Fields): Partial<Fields> {
  const errors: Partial<Fields> = {};
  if (data.name.trim().length < 2 || data.name.length > 100)
    errors.name = "Enter your name (2–100 characters).";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.email.length > 254)
    errors.email = "Enter a valid email address.";
  if (
    !/^\+?[\d ()-]{7,24}$/.test(data.phone) ||
    data.phone.replace(/\D/g, "").length < 7 ||
    data.phone.replace(/\D/g, "").length > 15
  )
    errors.phone = "Enter a valid phone number (7–15 digits).";
  if (!data.company.trim() || data.company.length > 160)
    errors.company = "Enter your organization (up to 160 characters).";
  if (!data.service.trim() || data.service.length > 120)
    errors.service = "Tell us your service of interest (up to 120 characters).";
  if (data.message.trim().length < 10 || data.message.length > 4000)
    errors.message = "Enter a message (10–4,000 characters).";
  return errors;
}
export default function ContactForm() {
  const [values, setValues] = useState<Fields>(blank);
  const [errors, setErrors] = useState<Partial<Fields>>({});
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [success, setSuccess] = useState(false);
  const busy = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  const key = useRef<string | null>(null);
  const fingerprint = useRef("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy.current || !apiAvailable) return;
    const normalized = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v.trim()]),
    ) as Fields;
    const found = validate(normalized);
    setErrors(found);
    setStatus("");
    setSuccess(false);
    if (Object.keys(found).length) {
      requestAnimationFrame(() =>
        form.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    busy.current = true;
    setPending(true);
    const body = JSON.stringify(normalized);
    if (fingerprint.current !== body || !key.current) {
      key.current = crypto.randomUUID();
      fingerprint.current = body;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch(apiUrl("/api/contact"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": key.current!,
        },
        body,
        signal: controller.signal,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        if (result?.fields) setErrors(result.fields);
        setStatus(
          response.status === 429
            ? "Too many enquiries. Please wait a few minutes before trying again."
            : response.status === 400
              ? "Please check the form and try again."
              : response.status === 409
                ? "This enquiry is still being processed. Please wait before retrying."
                : "We could not confirm your enquiry notification. Please try again later.",
        );
        return;
      }
      if (result?.email !== "accepted") {
        setStatus(
          "We could not confirm your enquiry notification. Please try again later.",
        );
        return;
      }
      setSuccess(true);
      setStatus(
        "Your enquiry notification was accepted by our email service. This does not confirm inbox delivery.",
      );
      setValues(blank);
      key.current = null;
    } catch {
      setStatus(
        "We could not confirm receipt. Check your connection and retry the same enquiry to avoid duplicates.",
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
    type = "text",
    max = 160,
  ) => (
    <div className={`field ${name === "message" ? "full" : ""}`}>
      <label htmlFor={name}>
        {label} <span aria-hidden="true">*</span>
      </label>
      {name === "message" ? (
        <textarea
          id={name}
          name={name}
          value={values[name]}
          maxLength={4000}
          rows={5}
          required
          aria-invalid={!!errors[name]}
          aria-describedby={errors[name] ? `${name}-error` : undefined}
          onChange={(e) => setValues({ ...values, [name]: e.target.value })}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={values[name]}
          maxLength={max}
          required
          autoComplete={
            name === "name"
              ? "name"
              : name === "email"
                ? "email"
                : name === "phone"
                  ? "tel"
                  : name === "company"
                    ? "organization"
                    : "off"
          }
          list={
            name === "service" && content.services.length
              ? "service-options"
              : undefined
          }
          aria-invalid={!!errors[name]}
          aria-describedby={errors[name] ? `${name}-error` : undefined}
          onChange={(e) => setValues({ ...values, [name]: e.target.value })}
        />
      )}{" "}
      {errors[name] && (
        <span id={`${name}-error`} className="field-error">
          {errors[name]}
        </span>
      )}
    </div>
  );
  return (
    <form ref={form} onSubmit={submit} noValidate aria-busy={pending}>
      <p className="eyebrow">ENQUIRY FORM</p>
      <h2>Tell us a little more.</h2>
      {!apiAvailable && <p className="form-note" role="status">Enquiries are unavailable in this preview. No details will be sent or stored.</p>}
      <p className="form-note">
        All fields are required. Select a suggested service or enter your own topic,
        then describe the scope you would like to discuss. Please do not include
        patient records or sensitive medical information.
      </p>
      <fieldset disabled={pending}>
        <legend className="sr-only">Your enquiry</legend>
        <div className="form-grid">
          {field("name", "Name", "text", 100)}
          {field("email", "Email", "email", 254)}
          {field("phone", "Phone", "tel", 24)}
          {field("company", "Company / Organization")}
          {field("service", "Service of interest", "text", 120)}
          {field("message", "Message")}
        </div>
      </fieldset>
      <datalist id="service-options">
        {content.services.map((s) => (
          <option key={s.slug} value={s.title} />
        ))}
      </datalist>
      <p className="form-note">
        Your details are used to respond to this enquiry and sent to the
        configured company mailbox.
      </p>
      <button className="button" type="submit" disabled={pending || !apiAvailable}>
        {pending ? "Sending enquiry…" : "Send enquiry"}{" "}
        <span aria-hidden="true">↗</span>
      </button>
      <div
        aria-live="polite"
        aria-atomic="true"
        className={`form-status ${success ? "success" : ""}`}
      >
        {status}
      </div>
    </form>
  );
}
