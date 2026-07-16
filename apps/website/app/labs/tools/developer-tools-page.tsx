import Link from "next/link";
import type { Locale } from "../../../lib/i18n-core";
import { getLocalePath } from "../../../lib/locale-routing";
import { DeveloperToolsClient } from "./developer-tools-client";

const copy = {
  zh: {
    eyebrow: "Labs / Browser-only",
    title: "一组不需要把数据交给服务器的开发者工具。",
    description: "用于快速检查和转换日常开发文本。首次加载后，所有操作都由浏览器原生 API 在本地完成。",
    back: "返回实验室"
  },
  en: {
    eyebrow: "Labs / Browser-only",
    title: "A developer toolbox that does not hand your input to a server.",
    description: "Inspect and transform everyday development text with browser-native APIs after the page loads.",
    back: "Back to Labs"
  }
} as const;

export function DeveloperToolsPage({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:py-20">
      <header className="border-b border-edge/70 pb-10 md:pb-14">
        <p className="section-kicker">{t.eyebrow}</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-primary sm:text-5xl md:text-6xl">
          {t.title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-secondary sm:text-lg">{t.description}</p>
        <Link href={getLocalePath("/labs", locale)} className="link-muted mt-6 inline-flex text-sm font-medium">
          <span aria-hidden="true">←</span><span className="ml-2">{t.back}</span>
        </Link>
      </header>
      <div className="pt-10 md:pt-14">
        <DeveloperToolsClient locale={locale} />
      </div>
    </main>
  );
}
