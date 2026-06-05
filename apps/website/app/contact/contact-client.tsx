"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { useI18n } from "../../components/language-provider";
import { getLocalePath } from "../../lib/locale-routing";
import { TEXT_SM_MUTED, TITLE_2XL, TITLE_BASE } from "../../lib/typography";

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

// Map a server validation code to the field it belongs to, so the error can be
// shown next to the relevant input instead of only in a single global banner.
// Codes with no specific field (rate_limited, duplicate_submit, *_failure) → null.
function fieldForErrorCode(
  code: string,
  formState: ContactFormState
): keyof ContactFormState | null {
  switch (code) {
    case "invalid_contact":
      return "contact";
    case "low_quality_input":
      return "project_goal";
    case "invalid_link":
      return "links";
    case "missing_required_field":
      if (!formState.name.trim()) return "name";
      if (!formState.contact.trim()) return "contact";
      if (!formState.project_goal.trim()) return "project_goal";
      return "name";
    default:
      return null;
  }
}

export function ContactClient() {
  const { locale, messages } = useI18n();
  const copy = messages.pages.contact;
  const formCopy = copy.contactForm;
  const common = messages.pages.common;
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
  const errorCode = submitState.status === "error" ? submitState.code : null;
  const errorMessage = submitState.status === "error" ? submitState.message : "";
  const erroredField = errorCode ? fieldForErrorCode(errorCode, formState) : null;
  const isFieldErrored = (field: keyof ContactFormState) => erroredField === field;
  const baseFieldClass =
    "w-full rounded-xl border bg-base/60 px-3 py-2 text-sm text-primary outline-none transition focus:ring-2";
  const fieldClass = (field: keyof ContactFormState) =>
    `${baseFieldClass} ${
      isFieldErrored(field)
        ? "border-red-500/70 focus:border-red-500 focus:ring-red-500/20"
        : "border-edge focus:border-accent focus:ring-accent/20"
    }`;
  const fieldError = (field: keyof ContactFormState) =>
    isFieldErrored(field) ? (
      <span id={`${field}-error`} role="alert" className="block text-xs font-normal text-red-300">
        {errorMessage}
      </span>
    ) : null;
  const requiredMark = <span aria-hidden="true" className="ml-0.5 text-red-400">*</span>;
  const optionalMark = (
    <span className="ml-1.5 text-xs font-normal text-muted">({formCopy.optionalLabel})</span>
  );

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-14 sm:px-6 md:py-20">
      <header className="panel-surface p-6 sm:p-9">
        <p className={TEXT_SM_MUTED}>{copy.eyebrow}</p>
        <h1 className={`mt-2 ${TITLE_2XL}`}>{copy.title}</h1>
        <p className={`mt-4 max-w-2xl ${TEXT_SM_MUTED} leading-relaxed`}>{copy.description}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href={getHref("/projects")} className="btn-primary">
            {copy.primaryAction}
          </Link>
          <Link href={getHref("/blog")} className="btn-secondary">
            {copy.secondaryAction}
          </Link>
        </div>
        <div className={`mt-6 flex flex-wrap items-center gap-5 ${TEXT_SM_MUTED}`}>
          <Link href={getHref("/enter")} className="link-accent font-medium">
            {common.backToEnter}
          </Link>
          <Link href={getHref("/")} className="link-muted font-medium">
            {common.backToHome}
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="panel-surface p-5 sm:p-6">
          <h2 className={TITLE_BASE}>{copy.collaborationTitle}</h2>
          <ul className={`mt-4 space-y-3 ${TEXT_SM_MUTED}`}>
            {copy.collaborationAreas.map((area) => (
              <li key={area} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel-surface p-5 sm:p-6">
          <h2 className={TITLE_BASE}>{copy.boundariesTitle}</h2>
          <ul className={`mt-4 space-y-3 ${TEXT_SM_MUTED}`}>
            {copy.boundaries.map((boundary) => (
              <li key={boundary} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                <span>{boundary}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="panel-surface p-5 sm:p-6">
        <p className="section-kicker">{copy.contactPathTitle}</p>
        <h2 className={`mt-2 ${TITLE_BASE}`}>{copy.contactPathTitle}</h2>
        <p className={`mt-3 ${TEXT_SM_MUTED} leading-7`}>{copy.contactPathDescription}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <article className="evidence-card">
            <p className="text-sm font-semibold text-primary">{copy.contactDecisionTitle}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-accent">
              {copy.contactDecisionStatus}
            </p>
            <p className={`mt-2 ${TEXT_SM_MUTED} leading-6`}>{copy.contactDecisionDescription}</p>
          </article>
          <article className="evidence-card">
            <p className="text-sm font-semibold text-primary">{copy.formSpecTitle}</p>
            <p className={`mt-2 ${TEXT_SM_MUTED} leading-6`}>{copy.formSpecAction}</p>
          </article>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {copy.contactChannels.map((channel) => (
            <Link
              key={channel.href}
              href={channel.href.startsWith("http") ? channel.href : getHref(channel.href)}
              target={channel.href.startsWith("http") ? "_blank" : undefined}
              rel={channel.href.startsWith("http") ? "noreferrer" : undefined}
              className="evidence-card card-interactive flex h-full flex-col"
            >
              <span className="text-sm font-semibold text-accent">{channel.label}</span>
              <span className={`mt-2 ${TEXT_SM_MUTED} leading-6`}>{channel.description}</span>
            </Link>
          ))}
        </div>
        <p className={`mt-5 rounded-xl border border-edge/70 bg-base/40 p-4 ${TEXT_SM_MUTED} leading-7`}>
          {copy.responseExpectation}
        </p>
      </section>

      <section className="panel-surface p-5 sm:p-6">
        <p className="section-kicker">{formCopy.eyebrow}</p>
        <h2 className={`mt-2 ${TITLE_BASE}`}>{formCopy.title}</h2>
        <p className={`mt-3 ${TEXT_SM_MUTED} leading-7`}>{formCopy.description}</p>
        <p className="mt-2 text-xs text-muted">{formCopy.requiredHint}</p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
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
              <span>{formCopy.fields.name.label}{requiredMark}</span>
              <input
                name="name"
                value={formState.name}
                onChange={(event) => updateField("name", event.target.value)}
                autoComplete="name"
                className={fieldClass("name")}
                required
                aria-required="true"
                aria-invalid={isFieldErrored("name") || undefined}
                aria-describedby={isFieldErrored("name") ? "name-error" : undefined}
              />
              {fieldError("name")}
            </label>

            <label className="space-y-2 text-sm font-medium text-secondary">
              <span>{formCopy.fields.contact.label}{requiredMark}</span>
              <input
                name="contact"
                value={formState.contact}
                onChange={(event) => updateField("contact", event.target.value)}
                autoComplete="email"
                className={fieldClass("contact")}
                required
                aria-required="true"
                aria-invalid={isFieldErrored("contact") || undefined}
                aria-describedby={isFieldErrored("contact") ? "contact-error" : undefined}
              />
              {fieldError("contact")}
            </label>
          </div>

          <label className="space-y-2 text-sm font-medium text-secondary">
            <span>{formCopy.fields.project_goal.label}{requiredMark}</span>
            <textarea
              name="project_goal"
              value={formState.project_goal}
              onChange={(event) => updateField("project_goal", event.target.value)}
              className={`min-h-32 ${fieldClass("project_goal")}`}
              required
              aria-required="true"
              aria-invalid={isFieldErrored("project_goal") || undefined}
              aria-describedby={
                isFieldErrored("project_goal") ? "project_goal-error project_goal-hint" : "project_goal-hint"
              }
            />
            <span id="project_goal-hint" className="block text-xs font-normal text-muted">{formCopy.fields.project_goal.hint}</span>
            {fieldError("project_goal")}
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-secondary">
              <span>{formCopy.fields.timeline.label}{optionalMark}</span>
              <input
                name="timeline"
                value={formState.timeline}
                onChange={(event) => updateField("timeline", event.target.value)}
                className={fieldClass("timeline")}
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-secondary">
              <span>{formCopy.fields.budget_range.label}{optionalMark}</span>
              <input
                name="budget_range"
                value={formState.budget_range}
                onChange={(event) => updateField("budget_range", event.target.value)}
                className={fieldClass("budget_range")}
              />
            </label>
          </div>

          <label className="space-y-2 text-sm font-medium text-secondary">
            <span>{formCopy.fields.links.label}{optionalMark}</span>
            <textarea
              name="links"
              value={formState.links}
              onChange={(event) => updateField("links", event.target.value)}
              className={`min-h-24 ${fieldClass("links")}`}
              aria-invalid={isFieldErrored("links") || undefined}
              aria-describedby={
                isFieldErrored("links") ? "links-error links-hint" : "links-hint"
              }
            />
            <span id="links-hint" className="block text-xs font-normal text-muted">{formCopy.fields.links.hint}</span>
            {fieldError("links")}
          </label>

          <div className="grid gap-3 md:grid-cols-3">
            <p className="rounded-xl border border-edge/70 bg-base/35 p-3 text-xs leading-6 text-muted">
              {copy.contactForm.privacyNotice}
            </p>
            <p className="rounded-xl border border-edge/70 bg-base/35 p-3 text-xs leading-6 text-muted">
              {copy.contactForm.retentionNotice}
            </p>
            <p className="rounded-xl border border-edge/70 bg-base/35 p-3 text-xs leading-6 text-muted">
              {copy.contactForm.deletionNotice}
            </p>
          </div>

          {submitState.status === "error" && erroredField === null ? (
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
    </main>
  );
}
