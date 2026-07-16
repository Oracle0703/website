"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { getLocalePath } from "../../lib/locale-routing";
import type { Locale, Messages } from "../../lib/i18n";
import { TEXT_SM_MUTED, TITLE_2XL } from "../../lib/typography";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; code: string; message: string }
  | { status: "received"; submissionId: string }
  | { status: "received_with_notification_failure"; submissionId: string };

type ContactFormState = {
  name: string;
  contact: string;
  project_goal: string;
  timeline: string;
  budget_range: string;
  links: string;
  honeypot: string;
};

const initialFormState: ContactFormState = {
  name: "",
  contact: "",
  project_goal: "",
  timeline: "",
  budget_range: "",
  links: "",
  honeypot: ""
};

function normalizeLinks(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

type ContactClientProps = {
  locale: Locale;
  copy: Messages["pages"]["contact"];
  common: Messages["pages"]["common"];
};

export function ContactClient({ locale, copy, common }: ContactClientProps) {
  const formCopy = copy.contactForm;
  const getHref = (href: string) => getLocalePath(href, locale);
  const [formState, setFormState] = useState<ContactFormState>(initialFormState);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  const updateField = (field: keyof ContactFormState, value: string) => {
    setFormState((current) => ({
      ...current,
      [field]: value
    }));
  };

  const getErrorMessage = (code: string, fallback?: string) =>
    formCopy.errors[code as keyof typeof formCopy.errors] ?? fallback ?? formCopy.errors.submit_failure;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitState({ status: "submitting" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          ...formState,
          links: normalizeLinks(formState.links)
        })
      });

      const payload = await response.json().catch(() => ({}));
      const submissionId = typeof payload.submission_id === "string" ? payload.submission_id : "";

      if (response.ok && payload.status === "received_with_notification_failure" && submissionId) {
        setSubmitState({
          status: "received_with_notification_failure",
          submissionId
        });
        return;
      }

      if (response.ok && submissionId) {
        setSubmitState({
          status: "received",
          submissionId
        });
        setFormState(initialFormState);
        return;
      }

      const code = typeof payload.error?.code === "string" ? payload.error.code : "submit_failure";
      setSubmitState({
        status: "error",
        code,
        message: getErrorMessage(code, payload.error?.message)
      });
    } catch {
      setSubmitState({
        status: "error",
        code: "submit_failure",
        message: formCopy.errors.submit_failure
      });
    }
  };

  const isSubmitting = submitState.status === "submitting";
  const githubChannel = copy.contactChannels.find((channel) => channel.href.startsWith("http"));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:py-20">
      <header className="border-b border-edge/70 pb-10 md:pb-14">
        <p className="section-kicker">{copy.eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.035em] text-primary sm:text-5xl">
          {copy.title}
        </h1>
        <p className={`mt-5 max-w-2xl ${TEXT_SM_MUTED} text-base leading-7 sm:text-lg`}>
          {copy.description}
        </p>
        <Link href={getHref("/")} className="link-muted mt-6 inline-flex text-sm font-medium">
          {common.backToHome}
        </Link>
      </header>

      <div className="grid gap-10 pt-10 md:pt-14 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-14">
        <aside className="space-y-8">
          <section>
            <p className="section-kicker">{copy.contactPathEyebrow}</p>
            <h2 className={`mt-3 ${TITLE_2XL}`}>{copy.collaborationTitle}</h2>
            <ul className="mt-6 divide-y divide-edge/70 border-y border-edge/70">
              {copy.collaborationAreas.map((area) => (
                <li key={area} className="flex gap-3 py-4 text-sm leading-6 text-secondary">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-secondary" aria-hidden="true" />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </section>

          <p className="border-l-2 border-accent pl-4 text-sm leading-7 text-muted">
            {copy.responseExpectation}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href={getHref("/projects")} className="btn-secondary">
              {copy.primaryAction}
            </Link>
            {githubChannel ? (
              <Link
                href={githubChannel.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-accent inline-flex items-center px-2 py-2 text-sm font-semibold"
              >
                {githubChannel.label} <span className="ml-2" aria-hidden>{common.arrowRight}</span>
              </Link>
            ) : null}
          </div>

          <details className="border-y border-edge/70 py-4">
            <summary className="cursor-pointer text-sm font-semibold text-primary">
              {copy.boundariesTitle}
            </summary>
            <ul className={`mt-4 space-y-3 ${TEXT_SM_MUTED}`}>
              {copy.boundaries.map((boundary) => (
                <li key={boundary} className="flex gap-3 leading-6">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  <span>{boundary}</span>
                </li>
              ))}
            </ul>
          </details>
        </aside>

        <section className="feature-surface p-5 sm:p-7 md:p-8">
          <p className="section-kicker">{formCopy.eyebrow}</p>
          <h2 className={`mt-2 ${TITLE_2XL}`}>{formCopy.title}</h2>
          <p className={`mt-3 ${TEXT_SM_MUTED} leading-7`}>{formCopy.description}</p>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <input
            type="text"
            name="honeypot"
            value={formState.honeypot}
            onChange={(event) => updateField("honeypot", event.target.value)}
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-secondary">
              <span>{formCopy.fields.name.label}</span>
              <input
                name="name"
                value={formState.name}
                onChange={(event) => updateField("name", event.target.value)}
                autoComplete="name"
                className="w-full rounded-xl border border-edge bg-base/60 px-3 py-2 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                required
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-secondary">
              <span>{formCopy.fields.contact.label}</span>
              <input
                name="contact"
                value={formState.contact}
                onChange={(event) => updateField("contact", event.target.value)}
                autoComplete="email"
                className="w-full rounded-xl border border-edge bg-base/60 px-3 py-2 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                required
              />
            </label>
          </div>

          <label className="space-y-2 text-sm font-medium text-secondary">
            <span>{formCopy.fields.project_goal.label}</span>
            <textarea
              name="project_goal"
              value={formState.project_goal}
              onChange={(event) => updateField("project_goal", event.target.value)}
              className="min-h-32 w-full rounded-xl border border-edge bg-base/60 px-3 py-2 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              required
            />
            <span className="block text-xs font-normal text-muted">{formCopy.fields.project_goal.hint}</span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-secondary">
              <span>{formCopy.fields.timeline.label}</span>
              <input
                name="timeline"
                value={formState.timeline}
                onChange={(event) => updateField("timeline", event.target.value)}
                className="w-full rounded-xl border border-edge bg-base/60 px-3 py-2 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-secondary">
              <span>{formCopy.fields.budget_range.label}</span>
              <input
                name="budget_range"
                value={formState.budget_range}
                onChange={(event) => updateField("budget_range", event.target.value)}
                className="w-full rounded-xl border border-edge bg-base/60 px-3 py-2 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm font-medium text-secondary">
            <span>{formCopy.fields.links.label}</span>
            <textarea
              name="links"
              value={formState.links}
              onChange={(event) => updateField("links", event.target.value)}
              className="min-h-24 w-full rounded-xl border border-edge bg-base/60 px-3 py-2 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <span className="block text-xs font-normal text-muted">{formCopy.fields.links.hint}</span>
          </label>

            <details className="border-y border-edge/70 py-3 text-xs leading-6 text-muted">
              <summary className="cursor-pointer font-semibold text-secondary">
                {copy.contactForm.privacyNotice}
              </summary>
              <div className="mt-3 space-y-2">
                <p>{copy.contactForm.retentionNotice}</p>
                <p>{copy.contactForm.deletionNotice}</p>
              </div>
            </details>

          {submitState.status === "error" ? (
            <p className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm leading-6 text-red-200" role="alert">
              {submitState.message}
            </p>
          ) : null}

          {submitState.status === "received" ? (
            <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm leading-6 text-emerald-200" role="status">
              {formCopy.successTitle} {formCopy.submissionIdLabel}: {submitState.submissionId}
            </p>
          ) : null}

          {submitState.status === "received_with_notification_failure" ? (
            <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm leading-6 text-amber-100" role="status">
              {formCopy.errors.received_with_notification_failure} {formCopy.submissionIdLabel}: {submitState.submissionId}
            </p>
          ) : null}

            <button type="submit" className="btn-primary px-5 py-2.5" disabled={isSubmitting}>
              {isSubmitting ? formCopy.submitBusy : formCopy.submitIdle}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
