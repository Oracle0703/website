"use client";

import { type ReactNode, useMemo, useState } from "react";
import type { Locale } from "../../../lib/i18n-core";
import {
  DEVELOPER_TOOL_MAX_INPUT,
  contrastChecks,
  contrastRatio,
  decodeBase64,
  decodeUrlComponent,
  encodeBase64,
  encodeUrlComponent,
  formatJson,
  generateUuid,
  minifyJson,
  sha256Hex
} from "../../../lib/developer-tools";

const copy = {
  zh: {
    privacy: "所有输入都只在当前浏览器中处理，不会发送到本站服务器。单个输入最多 100,000 个字符。",
    input: "输入",
    output: "结果",
    copy: "复制",
    copied: "已复制到剪贴板。",
    copyFailed: "复制失败，请手动选择结果。",
    completed: "结果已生成。",
    invalid: "输入格式无效，请检查后重试。",
    empty: "请先输入需要处理的内容。",
    json: {
      eyebrow: "JSON",
      title: "格式化与压缩",
      description: "验证 JSON，并生成易读或紧凑的输出。不会执行输入中的任何代码。",
      placeholder: "粘贴 JSON…",
      format: "格式化",
      minify: "压缩"
    },
    codec: {
      eyebrow: "编码 / 解码",
      title: "URL 与 Base64",
      description: "支持 Unicode 文本的 URL component 与标准 Base64 转换。",
      placeholder: "输入文本或编码后的内容…",
      urlEncode: "URL 编码",
      urlDecode: "URL 解码",
      base64Encode: "Base64 编码",
      base64Decode: "Base64 解码"
    },
    uuid: {
      eyebrow: "标识符",
      title: "UUID v4",
      description: "使用浏览器加密随机源生成 UUID，不向网络发送请求。",
      generate: "生成新 UUID"
    },
    hash: {
      eyebrow: "摘要",
      title: "SHA-256",
      description: "通过浏览器 Web Crypto 计算 UTF-8 文本摘要；它不是密码加密或安全存储方案。",
      placeholder: "输入需要计算摘要的文本…",
      calculate: "计算 SHA-256",
      calculating: "正在计算…"
    },
    contrast: {
      eyebrow: "无障碍",
      title: "颜色对比度",
      description: "比较前景色与背景色，并检查 WCAG AA/AAA 文本阈值。",
      foreground: "前景色",
      background: "背景色",
      ratio: "对比度",
      pass: "通过",
      fail: "未通过",
      aaNormal: "AA 普通文本",
      aaLarge: "AA 大文本",
      aaaNormal: "AAA 普通文本",
      aaaLarge: "AAA 大文本",
      preview: "待测颜色示例文本"
    }
  },
  en: {
    privacy: "Every input is processed only in this browser and is never sent to this site's server. Each input is limited to 100,000 characters.",
    input: "Input",
    output: "Result",
    copy: "Copy",
    copied: "Copied to the clipboard.",
    copyFailed: "Copy failed. Select the result manually.",
    completed: "Result generated.",
    invalid: "The input format is invalid. Check it and try again.",
    empty: "Enter something to process first.",
    json: {
      eyebrow: "JSON",
      title: "Format and minify",
      description: "Validate JSON and produce readable or compact output. Input is never executed as code.",
      placeholder: "Paste JSON…",
      format: "Format",
      minify: "Minify"
    },
    codec: {
      eyebrow: "Encode / Decode",
      title: "URL and Base64",
      description: "Convert Unicode text with URL-component and standard Base64 codecs.",
      placeholder: "Enter text or an encoded value…",
      urlEncode: "URL encode",
      urlDecode: "URL decode",
      base64Encode: "Base64 encode",
      base64Decode: "Base64 decode"
    },
    uuid: {
      eyebrow: "Identifiers",
      title: "UUID v4",
      description: "Generate a UUID from the browser's cryptographic random source without a network request.",
      generate: "Generate UUID"
    },
    hash: {
      eyebrow: "Digest",
      title: "SHA-256",
      description: "Calculate a UTF-8 digest with browser Web Crypto. This is not password encryption or secure password storage.",
      placeholder: "Enter text to hash…",
      calculate: "Calculate SHA-256",
      calculating: "Calculating…"
    },
    contrast: {
      eyebrow: "Accessibility",
      title: "Color contrast",
      description: "Compare foreground and background colors against WCAG AA/AAA text thresholds.",
      foreground: "Foreground",
      background: "Background",
      ratio: "Contrast ratio",
      pass: "Pass",
      fail: "Fail",
      aaNormal: "AA normal text",
      aaLarge: "AA large text",
      aaaNormal: "AAA normal text",
      aaaLarge: "AAA large text",
      preview: "Sample text in the tested colors"
    }
  }
} as const;

function ToolCard({ id, eyebrow, title, description, children }: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-edge bg-surface/55 p-5 sm:p-7" aria-labelledby={`${id}-title`}>
      <p className="section-kicker">{eyebrow}</p>
      <h2 id={`${id}-title`} className="mt-2 text-2xl font-semibold text-primary">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function DeveloperToolsClient({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [announcement, setAnnouncement] = useState("");
  const [jsonInput, setJsonInput] = useState('{"hello":"world"}');
  const [jsonOutput, setJsonOutput] = useState("");
  const [codecInput, setCodecInput] = useState("");
  const [codecOutput, setCodecOutput] = useState("");
  const [uuid, setUuid] = useState("");
  const [hashInput, setHashInput] = useState("");
  const [hashOutput, setHashOutput] = useState("");
  const [hashing, setHashing] = useState(false);
  const [foreground, setForeground] = useState("#f7f3e8");
  const [background, setBackground] = useState("#171513");
  const ratio = useMemo(() => contrastRatio(foreground, background), [background, foreground]);
  const checks = useMemo(() => contrastChecks(ratio), [ratio]);

  const announceError = (input: string) => setAnnouncement(input ? t.invalid : t.empty);

  const copyResult = async (value: string) => {
    if (!value) {
      setAnnouncement(t.empty);
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setAnnouncement(t.copied);
    } catch {
      setAnnouncement(t.copyFailed);
    }
  };

  const transformJson = (mode: "format" | "minify") => {
    try {
      setJsonOutput(mode === "format" ? formatJson(jsonInput) : minifyJson(jsonInput));
      setAnnouncement(t.completed);
    } catch {
      announceError(jsonInput);
    }
  };

  const transformCodec = (mode: "url-encode" | "url-decode" | "base64-encode" | "base64-decode") => {
    if (!codecInput) {
      setAnnouncement(t.empty);
      return;
    }
    try {
      const transforms = {
        "url-encode": encodeUrlComponent,
        "url-decode": decodeUrlComponent,
        "base64-encode": encodeBase64,
        "base64-decode": decodeBase64
      };
      setCodecOutput(transforms[mode](codecInput));
      setAnnouncement(t.completed);
    } catch {
      announceError(codecInput);
    }
  };

  const calculateHash = async () => {
    if (!hashInput) {
      setAnnouncement(t.empty);
      return;
    }
    setHashing(true);
    try {
      setHashOutput(await sha256Hex(hashInput));
      setAnnouncement(t.completed);
    } catch {
      setAnnouncement(t.invalid);
    } finally {
      setHashing(false);
    }
  };

  const resultArea = (value: string, label: string) => (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-primary">{label}</span>
        <button
          type="button"
          className="link-accent text-xs font-semibold"
          aria-label={`${t.copy}: ${label}`}
          onClick={() => void copyResult(value)}
        >
          {t.copy}
        </button>
      </div>
      <textarea
        value={value}
        readOnly
        aria-label={label}
        rows={7}
        className="mt-2 w-full resize-y rounded-xl border border-edge bg-base/70 p-3 font-mono text-xs leading-6 text-secondary outline-none focus-visible:border-accent"
      />
    </div>
  );

  return (
    <>
      <p className="rounded-xl border border-edge bg-base/60 p-4 text-sm leading-6 text-muted">{t.privacy}</p>
      <nav className="mt-5 flex flex-wrap gap-2" aria-label={locale === "en" ? "Tool shortcuts" : "工具快捷入口"}>
        {[
          ["json-tool", t.json.title],
          ["codec-tool", t.codec.title],
          ["uuid-tool", t.uuid.title],
          ["hash-tool", t.hash.title],
          ["contrast-tool", t.contrast.title]
        ].map(([href, label]) => (
          <a key={href} href={`#${href}`} className="rounded-full border border-edge px-3 py-1.5 text-xs font-semibold text-secondary hover:border-accent/50 hover:text-accent">
            {label}
          </a>
        ))}
      </nav>

      <div className="mt-8 space-y-6">
        <ToolCard id="json-tool" eyebrow={t.json.eyebrow} title={t.json.title} description={t.json.description}>
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label htmlFor="developer-json-input" className="text-sm font-semibold text-primary">{t.input}</label>
              <textarea
                id="developer-json-input"
                value={jsonInput}
                onChange={(event) => setJsonInput(event.target.value)}
                maxLength={DEVELOPER_TOOL_MAX_INPUT}
                rows={7}
                placeholder={t.json.placeholder}
                spellCheck={false}
                className="mt-2 w-full resize-y rounded-xl border border-edge bg-base/70 p-3 font-mono text-xs leading-6 text-primary outline-none focus:border-accent"
              />
              <div className="mt-3 flex flex-wrap gap-3">
                <button type="button" className="btn-primary" onClick={() => transformJson("format")}>{t.json.format}</button>
                <button type="button" className="btn-secondary" onClick={() => transformJson("minify")}>{t.json.minify}</button>
              </div>
            </div>
            {resultArea(jsonOutput, t.output)}
          </div>
        </ToolCard>

        <ToolCard id="codec-tool" eyebrow={t.codec.eyebrow} title={t.codec.title} description={t.codec.description}>
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label htmlFor="developer-codec-input" className="text-sm font-semibold text-primary">{t.input}</label>
              <textarea
                id="developer-codec-input"
                value={codecInput}
                onChange={(event) => setCodecInput(event.target.value)}
                maxLength={DEVELOPER_TOOL_MAX_INPUT}
                rows={7}
                placeholder={t.codec.placeholder}
                spellCheck={false}
                className="mt-2 w-full resize-y rounded-xl border border-edge bg-base/70 p-3 font-mono text-xs leading-6 text-primary outline-none focus:border-accent"
              />
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <button type="button" className="btn-secondary" onClick={() => transformCodec("url-encode")}>{t.codec.urlEncode}</button>
                <button type="button" className="btn-secondary" onClick={() => transformCodec("url-decode")}>{t.codec.urlDecode}</button>
                <button type="button" className="btn-secondary" onClick={() => transformCodec("base64-encode")}>{t.codec.base64Encode}</button>
                <button type="button" className="btn-secondary" onClick={() => transformCodec("base64-decode")}>{t.codec.base64Decode}</button>
              </div>
            </div>
            {resultArea(codecOutput, t.output)}
          </div>
        </ToolCard>

        <ToolCard id="uuid-tool" eyebrow={t.uuid.eyebrow} title={t.uuid.title} description={t.uuid.description}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input value={uuid} readOnly aria-label={t.output} className="min-w-0 flex-1 rounded-xl border border-edge bg-base/70 px-3 py-3 font-mono text-sm text-primary outline-none focus-visible:border-accent" />
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                try {
                  setUuid(generateUuid());
                  setAnnouncement(t.completed);
                } catch {
                  setAnnouncement(t.invalid);
                }
              }}
            >
              {t.uuid.generate}
            </button>
            <button type="button" className="btn-secondary" aria-label={`${t.copy}: ${t.uuid.title}`} onClick={() => void copyResult(uuid)}>{t.copy}</button>
          </div>
        </ToolCard>

        <ToolCard id="hash-tool" eyebrow={t.hash.eyebrow} title={t.hash.title} description={t.hash.description}>
          <label htmlFor="developer-hash-input" className="text-sm font-semibold text-primary">{t.input}</label>
          <textarea
            id="developer-hash-input"
            value={hashInput}
            onChange={(event) => setHashInput(event.target.value)}
            maxLength={DEVELOPER_TOOL_MAX_INPUT}
            rows={4}
            placeholder={t.hash.placeholder}
            className="mt-2 w-full resize-y rounded-xl border border-edge bg-base/70 p-3 text-sm leading-6 text-primary outline-none focus:border-accent"
          />
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" className="btn-primary" disabled={hashing} onClick={() => void calculateHash()}>
              {hashing ? t.hash.calculating : t.hash.calculate}
            </button>
            <button type="button" className="btn-secondary" aria-label={`${t.copy}: ${t.hash.title}`} onClick={() => void copyResult(hashOutput)}>{t.copy}</button>
          </div>
          <span id="developer-hash-output-label" className="mt-4 block text-sm font-semibold text-primary">{t.output}</span>
          <output aria-labelledby="developer-hash-output-label" className="mt-2 block overflow-x-auto rounded-xl border border-edge bg-base/70 p-3 font-mono text-xs leading-6 text-secondary">
            {hashOutput || "—"}
          </output>
        </ToolCard>

        <ToolCard id="contrast-tool" eyebrow={t.contrast.eyebrow} title={t.contrast.title} description={t.contrast.description}>
          <div className="grid gap-6 lg:grid-cols-[0.42fr_0.58fr]">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {[
                { id: "contrast-foreground", label: t.contrast.foreground, value: foreground, set: setForeground },
                { id: "contrast-background", label: t.contrast.background, value: background, set: setBackground }
              ].map((field) => (
                <label key={field.id} htmlFor={field.id} className="flex items-center justify-between gap-4 rounded-xl border border-edge bg-base/60 p-3 text-sm font-semibold text-primary">
                  <span>{field.label}</span>
                  <span className="flex items-center gap-3 font-mono text-xs text-muted">
                    {field.value}
                    <input id={field.id} type="color" value={field.value} onChange={(event) => field.set(event.target.value)} className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent" />
                  </span>
                </label>
              ))}
            </div>
            <div className="space-y-4">
              <div className="min-h-28 rounded-xl border border-edge p-5" style={{ color: foreground, backgroundColor: background }}>
                <p className="text-lg font-semibold">{t.contrast.preview}</p>
                <p className="mt-2 text-sm">Aa · 123 · Meaningful Ink</p>
              </div>
              <div className="rounded-xl border border-edge bg-base/70 p-5 text-primary">
                <p className="text-sm font-semibold text-secondary">{t.contrast.ratio}</p>
                <p className="mt-2 text-4xl font-semibold tracking-tight">{ratio.toFixed(2)}:1</p>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {[
                    [t.contrast.aaNormal, checks.aaNormal],
                    [t.contrast.aaLarge, checks.aaLarge],
                    [t.contrast.aaaNormal, checks.aaaNormal],
                    [t.contrast.aaaLarge, checks.aaaLarge]
                  ].map(([label, passed]) => (
                    <span key={String(label)} className="rounded-lg border border-edge px-3 py-2 text-xs font-semibold text-secondary">
                      {label}: {passed ? t.contrast.pass : t.contrast.fail}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ToolCard>
      </div>

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
    </>
  );
}
