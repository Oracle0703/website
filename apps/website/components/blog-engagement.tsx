"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "../lib/i18n";
import { getLocalePath } from "../lib/locale-routing";
import { useTheme } from "./theme-provider";

export type BlogDiscussionConfig = {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
};

type BlogEngagementProps = {
  locale: Locale;
  title: string;
  pathname: string;
  commentsEnabled: boolean;
  discussionConfig: BlogDiscussionConfig;
};

type Announcement = {
  id: number;
  text: string;
};

const copy = {
  zh: {
    eyebrow: "继续交流",
    title: "保存、分享或订阅",
    description: "把这篇文章分享给需要的人，或通过 RSS 跟进后续更新。",
    copyLink: "复制链接",
    share: "分享文章",
    rss: "订阅 RSS",
    copied: "文章链接已复制。",
    copyFailed: "浏览器无法自动复制，请从地址栏手动复制链接。",
    shared: "文章已通过系统分享。",
    shareCancelled: "已取消分享。",
    commentsEyebrow: "讨论",
    commentsTitle: "文章讨论",
    commentsDescription:
      "评论由 GitHub Discussions 托管。只有你点击加载后，浏览器才会连接并运行 Giscus 第三方脚本；参与讨论需要登录 GitHub。",
    loadComments: "加载评论",
    loadingComments: "正在加载 GitHub Discussions…",
    commentsLoaded: "评论区已加载。",
    commentsFailed: "评论区暂时无法加载，你仍可前往 GitHub Discussions。",
    configMissing:
      "评论已对本文开放，但站点尚未完成 Giscus 配置。为避免误连第三方，本页没有注入任何评论脚本。",
    visitDiscussions: "访问 GitHub Discussions"
  },
  en: {
    eyebrow: "Keep the conversation going",
    title: "Save, share, or subscribe",
    description: "Share this article with someone who needs it, or follow new writing via RSS.",
    copyLink: "Copy link",
    share: "Share article",
    rss: "Subscribe via RSS",
    copied: "Article link copied.",
    copyFailed: "Automatic copy is unavailable. Copy the link from the address bar instead.",
    shared: "Article shared through the system share sheet.",
    shareCancelled: "Sharing cancelled.",
    commentsEyebrow: "Discussion",
    commentsTitle: "Article discussion",
    commentsDescription:
      "Comments are hosted in GitHub Discussions. Your browser connects to and runs the third-party Giscus script only after you choose to load it; joining requires a GitHub account.",
    loadComments: "Load comments",
    loadingComments: "Loading GitHub Discussions…",
    commentsLoaded: "Comments loaded.",
    commentsFailed: "Comments could not load. You can still continue in GitHub Discussions.",
    configMissing:
      "Comments are enabled for this article, but the Giscus configuration is incomplete. No third-party comment script has been injected.",
    visitDiscussions: "Visit GitHub Discussions"
  }
} as const;

const REPO_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const ID_PATTERN = /^[A-Za-z0-9_-]+$/;

function normalizeConfig(config: BlogDiscussionConfig) {
  return {
    repo: config.repo.trim(),
    repoId: config.repoId.trim(),
    category: config.category.trim(),
    categoryId: config.categoryId.trim()
  };
}

function hasValidDiscussionConfig(config: BlogDiscussionConfig) {
  return (
    REPO_PATTERN.test(config.repo) &&
    config.repo.length <= 200 &&
    ID_PATTERN.test(config.repoId) &&
    config.repoId.length <= 160 &&
    config.category.length > 0 &&
    config.category.length <= 120 &&
    !/[\u0000-\u001f\u007f]/.test(config.category) &&
    ID_PATTERN.test(config.categoryId) &&
    config.categoryId.length <= 160
  );
}

function getCanonicalUrl(pathname: string) {
  return new URL(pathname, window.location.origin).toString();
}

function legacyCopy(value: string) {
  const previousFocus = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null;
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.readOnly = true;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    if (!document.execCommand("copy")) {
      throw new Error("copy command was rejected");
    }
  } finally {
    textarea.remove();
    previousFocus?.focus({ preventScroll: true });
  }
}

async function copyUrl(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Restricted browsers can expose Clipboard API while denying the write.
    }
  }

  legacyCopy(value);
}

export function BlogEngagement({
  locale,
  title,
  pathname,
  commentsEnabled,
  discussionConfig
}: BlogEngagementProps) {
  const labels = copy[locale];
  const { theme } = useTheme();
  const commentsMountRef = useRef<HTMLDivElement>(null);
  const announcementIdRef = useRef(0);
  const [announcement, setAnnouncement] = useState<Announcement>({ id: 0, text: "" });
  const [commentsRequested, setCommentsRequested] = useState(false);
  const [commentsState, setCommentsState] = useState<"idle" | "loading" | "loaded" | "failed">(
    "idle"
  );
  const config = normalizeConfig(discussionConfig);
  const configIsValid = hasValidDiscussionConfig(config);
  const discussionsHref = REPO_PATTERN.test(config.repo)
    ? `https://github.com/${config.repo}/discussions`
    : "https://github.com/features/discussions";

  const announce = (text: string) => {
    announcementIdRef.current += 1;
    setAnnouncement({ id: announcementIdRef.current, text });
  };

  const handleCopy = async () => {
    try {
      await copyUrl(getCanonicalUrl(pathname));
      announce(labels.copied);
    } catch {
      announce(labels.copyFailed);
    }
  };

  const handleShare = async () => {
    const url = getCanonicalUrl(pathname);

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        announce(labels.shared);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          announce(labels.shareCancelled);
          return;
        }
      }
    }

    try {
      await copyUrl(url);
      announce(labels.copied);
    } catch {
      announce(labels.copyFailed);
    }
  };

  useEffect(() => {
    if (!commentsEnabled || !configIsValid || !commentsRequested) return;

    const mount = commentsMountRef.current;
    if (!mount || mount.querySelector("script[data-giscus-loader], iframe.giscus-frame")) return;

    setCommentsState("loading");
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.referrerPolicy = "no-referrer";
    script.dataset.giscusLoader = "true";
    script.dataset.repo = config.repo;
    script.dataset.repoId = config.repoId;
    script.dataset.category = config.category;
    script.dataset.categoryId = config.categoryId;
    script.dataset.mapping = "specific";
    script.dataset.term = pathname;
    script.dataset.strict = "1";
    script.dataset.reactionsEnabled = "1";
    script.dataset.emitMetadata = "0";
    script.dataset.inputPosition = "top";
    script.dataset.theme = theme;
    script.dataset.lang = locale === "zh" ? "zh-CN" : "en";
    script.dataset.loading = "lazy";
    script.addEventListener("load", () => {
      setCommentsState("loaded");
      announce(labels.commentsLoaded);
    });
    script.addEventListener("error", () => {
      setCommentsState("failed");
      announce(labels.commentsFailed);
      script.remove();
    });
    mount.appendChild(script);

    return () => {
      script.remove();
      mount.querySelector("iframe.giscus-frame")?.remove();
    };
    // Theme changes are synchronized through Giscus' postMessage API below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentsEnabled, commentsRequested, configIsValid, locale, pathname]);

  useEffect(() => {
    if (commentsState !== "loaded") return;

    const frame = commentsMountRef.current?.querySelector<HTMLIFrameElement>("iframe.giscus-frame");
    frame?.contentWindow?.postMessage(
      { giscus: { setConfig: { theme } } },
      "https://giscus.app"
    );
  }, [commentsState, theme]);

  return (
    <section className="max-w-3xl border-y border-edge/70 py-8 sm:py-10" aria-labelledby="blog-engagement-title">
      <p className="section-kicker">{labels.eyebrow}</p>
      <h2 id="blog-engagement-title" className="mt-2 text-2xl font-semibold text-primary sm:text-3xl">
        {labels.title}
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-7 text-secondary">{labels.description}</p>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" className="btn-secondary" onClick={handleCopy}>
          {labels.copyLink}
        </button>
        <button type="button" className="btn-secondary" onClick={handleShare}>
          {labels.share}
        </button>
        <a
          className="btn-secondary"
          href={getLocalePath("/rss.xml", locale)}
          type="application/rss+xml"
        >
          {labels.rss}
        </a>
      </div>

      <p key={announcement.id} className="sr-only" role="status" aria-live="polite">
        {announcement.text}
      </p>

      {commentsEnabled ? (
        <div
          className="mt-9 border-t border-edge/70 pt-7"
          aria-labelledby="blog-comments-title"
        >
          <p className="section-kicker">{labels.commentsEyebrow}</p>
          <h3 id="blog-comments-title" className="mt-2 text-xl font-semibold text-primary sm:text-2xl">
            {labels.commentsTitle}
          </h3>
          <p className="mt-3 text-sm leading-6 text-muted">{labels.commentsDescription}</p>

          {configIsValid ? (
            <>
              {!commentsRequested ? (
                <button
                  type="button"
                  className="btn-primary mt-5"
                  onClick={() => setCommentsRequested(true)}
                >
                  {labels.loadComments}
                </button>
              ) : null}
              {commentsState === "loading" ? (
                <p className="mt-5 text-sm text-muted">{labels.loadingComments}</p>
              ) : null}
              {commentsState === "failed" ? (
                <p className="mt-5 text-sm leading-6 text-muted">{labels.commentsFailed}</p>
              ) : null}
              <div ref={commentsMountRef} className="mt-5 min-h-12" />
              <a
                className="link-accent mt-4 inline-flex text-sm font-semibold"
                href={discussionsHref}
                target="_blank"
                rel="noreferrer"
              >
                {labels.visitDiscussions}
              </a>
            </>
          ) : (
            <div className="evidence-card mt-5">
              <p className="text-sm leading-6 text-muted">{labels.configMissing}</p>
              <a
                className="link-accent mt-3 inline-flex text-sm font-semibold"
                href={discussionsHref}
                target="_blank"
                rel="noreferrer"
              >
                {labels.visitDiscussions}
              </a>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
