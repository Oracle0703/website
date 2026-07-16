import Link from "next/link";
import { getLocalePath } from "../../../lib/locale-routing";
import type { Locale, Messages } from "../../../lib/i18n";
import { TEXT_SM_MUTED } from "../../../lib/typography";
import { FreeQueryClient } from "./free-query-client";

type FreeQueryPageProps = {
  locale: Locale;
  copy: Messages["pages"]["freeQuery"];
};

export function FreeQueryPage({ locale, copy }: FreeQueryPageProps) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:py-20">
      <header className="border-b border-edge/70 pb-10 md:pb-14">
        <p className="section-kicker">{copy.eyebrow}</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-primary sm:text-5xl md:text-6xl">
          {copy.title}
        </h1>
        <p className={`mt-5 max-w-3xl ${TEXT_SM_MUTED} text-base leading-7 sm:text-lg`}>
          {copy.description}
        </p>
        <Link
          href={getLocalePath("/labs", locale)}
          className="link-muted mt-6 inline-flex text-sm font-medium"
        >
          <span aria-hidden="true">←</span>
          <span className="ml-2">{copy.backToLabs}</span>
        </Link>
      </header>

      <div className="pt-10 md:pt-14">
        <FreeQueryClient locale={locale} copy={copy} />
      </div>

      <section className="mt-12 border-t border-edge/70 pt-8 md:mt-16 md:pt-10" aria-labelledby="query-api-title">
        <div className="grid gap-7 md:grid-cols-[0.42fr_0.58fr] md:gap-12">
          <div>
            <p className="section-kicker">{copy.apiEyebrow}</p>
            <h2 id="query-api-title" className="mt-2 text-2xl font-semibold tracking-tight text-primary">
              {copy.apiTitle}
            </h2>
            <p className={`mt-3 ${TEXT_SM_MUTED} leading-7`}>{copy.apiDescription}</p>
          </div>
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-primary">{copy.locationsEndpoint}</p>
              <pre className="mt-2 overflow-x-auto rounded-xl border border-edge bg-base/70 p-4 text-xs leading-6 text-accent-secondary">
                <code>{`GET /api/query/locations?q=Shanghai&lang=${locale}`}</code>
              </pre>
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">{copy.weatherEndpoint}</p>
              <pre className="mt-2 overflow-x-auto rounded-xl border border-edge bg-base/70 p-4 text-xs leading-6 text-accent-secondary">
                <code>{`GET /api/query/weather?q=31.2304%2C121.4737&lang=${locale}&units=metric`}</code>
              </pre>
            </div>
            <p className="text-sm leading-6 text-muted">{copy.apiBoundary}</p>
          </div>
        </div>
      </section>

      <aside className="mt-12 grid gap-7 border-t border-edge/70 pt-8 md:grid-cols-[0.42fr_0.58fr] md:gap-12">
        <div>
          <p className="section-kicker">{copy.fairUseTitle}</p>
          <p className={`mt-3 ${TEXT_SM_MUTED} leading-7`}>{copy.fairUseDescription}</p>
        </div>
        <div className="space-y-4 text-sm leading-6 text-muted">
          <p>{copy.privacyNotice}</p>
          <p>{copy.disclaimer}</p>
          <p>
            {copy.attributionPrefix}{" "}
            <a
              href="https://www.weatherapi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="link-accent font-semibold"
            >
              WeatherAPI.com
            </a>
          </p>
        </div>
      </aside>
    </main>
  );
}
