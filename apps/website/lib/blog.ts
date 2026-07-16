import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { defaultLocale, isLocale, type Locale } from "./i18n";
import { isBlogTopicId, type BlogTopicId } from "./blog-topics";

export type PostStatus = "draft" | "published" | "archived" | "scheduled";

export interface CoverImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  blurDataURL?: string;
}

export interface SEOConfig {
  description: string;
  keywords?: string[];
  noindex?: boolean;
  canonical?: string;
  ogImage?: string;
}

export interface BlogSeriesFrontmatter {
  id: string;
  title: string;
  order: number;
}

export interface BlogPostFrontmatter {
  title: string;
  slug: string;
  date: string;
  updatedAt: string;
  summary: string;
  cover: string | CoverImage;
  author: string;
  tags?: string[];
  category?: BlogTopicId;
  status?: PostStatus;
  publishDate?: string;
  draft?: boolean;
  seo?: SEOConfig;
  type?: "article" | "tutorial" | "note" | "translation" | "announcement";
  locale?: Locale;
  availableLocales?: Locale[];
  translationOf?: string | null;
  translations?: Partial<Record<Locale, string | null>>;
  series?: BlogSeriesFrontmatter;
  relatedPosts?: string[];
  comments?: { enabled: boolean; provider?: string };
}

export type BlogPost = BlogPostFrontmatter & {
  content: string;
  wordCount: number;
  readingTime: number;
  filePath: string;
};

type LocalizedPostOverride = {
  title: string;
  summary: string;
  content: string;
  coverAlt?: string;
  seo?: SEOConfig;
  seriesTitle?: string;
};

type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
const STATUS_VALUES: PostStatus[] = ["draft", "published", "archived", "scheduled"];

const localizedPostOverrides: Record<string, Partial<Record<Locale, LocalizedPostOverride>>> = {
  "ci-agent-guardrails": {
    en: {
      title: "CI Agent Guardrails: You Need Boundaries, Not Better Prompts",
      summary:
        "When agents enter CI/CD, the risk shifts from inaccurate answers to permissions, network access, dependencies, and traceability. This is a practical minimum guardrails checklist.",
      coverAlt: "CI Agent Guardrails minimum checklist",
      seriesTitle: "AI Productization Practice",
      seo: {
        description:
          "A practical CI Agent guardrails checklist covering least privilege, network egress, verifiable dependencies, traceable outputs, and rollback-safe failure modes.",
        keywords: ["CI", "Agent", "Guardrails", "Supply Chain Security", "Least Privilege"]
      },
      content: `
## Start with the real problem

Running an agent locally is usually a contained risk: it may write the wrong code, waste time, or require review.

Putting an agent into CI/CD changes the threat model. The agent may receive write permissions, reach external networks, pull dependencies, upload artifacts, or trigger deployment behavior. At that point, the risk is no longer just answer quality. The risk is operational control.

The first goal of a CI agent is not to become smarter. The first goal is to remain bounded, observable, and reversible.

## Minimum guardrail 1: permissions

Start from read-only access. Let the agent inspect the repository, produce reports, and propose changes before it can write to anything.

A practical baseline:

- Git access defaults to read-only.
- Write access, when needed, goes through a dedicated branch or pull request.
- Secrets are not available by default.
- Any secret access requires explicit approval, short-lived credentials, and narrow scope.
- Filesystem writes use an allowlist instead of broad workspace access.

The safest production pattern is to let the agent create reviewable changes, not push directly to the main branch.

## Minimum guardrail 2: network egress

Network access is a data boundary. If the agent can call arbitrary external services, it can leak logs, tokens, source snippets, or build artifacts.

Use a deny-by-default policy:

- Disable outbound network access by default.
- Allow only known domains when a task truly needs network access.
- Log each request target, status, and purpose.
- Block direct script execution patterns such as remote shell piping.

Connectivity is not just a capability increase. It is also a risk multiplier.

## Minimum guardrail 3: dependency verification

Many automation incidents begin when an executable dependency is treated like harmless text.

The minimum bar:

- Lockfiles are required and reviewed.
- Dependency versions are pinned.
- External tools, skills, and scripts have an allowed source.
- Downloaded artifacts are tied to version and checksum when possible.
- CI records which dependency inputs were used for each run.

The agent should not be able to silently change the supply chain beneath the build.

## Minimum guardrail 4: traceable outputs

Every agent run should answer four questions:

1. What changed?
2. Why did it change?
3. How can it be rolled back?
4. Who or what approved the action?

That means each run should produce logs, a diff, a task summary, and a clear rollback path. Long outputs should be written to files or archived reports so important details are not lost in a truncated chat message.

## Minimum guardrail 5: failure modes

Assume that the agent will eventually generate a bad patch, hit a flaky dependency, or time out in the middle of a workflow.

Design for that reality:

- A run can be stopped immediately.
- Re-running is idempotent.
- Partial output does not corrupt the workspace.
- Rollback scripts are treated as part of the deployment surface.
- Failed runs leave enough evidence for diagnosis.

## A practical MVP workflow

The minimum trustworthy CI agent loop looks like this:

1. The agent scans the repository with read-only access.
2. It writes a report or opens a pull request on a controlled branch.
3. The pull request must pass lint, build, and tests.
4. Human review approves the change before merge.
5. The run log and generated artifacts are archived.

This gives you the agent's production leverage while keeping the system auditable and reversible.

## Closing

Once agents participate in engineering workflows, the deciding factor is not prompt style. The deciding factor is control engineering.

Open permissions in this order: first traceability, then rollback, then limited writes, and only then carefully scoped network access.
`.trim()
    }
  }
};

function findContentRootFrom(startDir: string) {
  let current = startDir;

  // Search up the directory tree so deploy working directories can vary.
  for (let i = 0; i < 10; i += 1) {
    const candidate = path.join(current, "content", "blog");
    if (fs.existsSync(candidate)) return candidate;

    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return null;
}

function getContentRoot() {
  // Production deployments should set this to an absolute path like:
  // `C:\\services\\meaningful-website\\current\\content\\blog`.
  const override = process.env.BLOG_CONTENT_ROOT;
  if (override) {
    const candidates = [override, path.join(override, "content", "blog")];
    const matched = candidates.find((candidate) => fs.existsSync(candidate));
    if (matched) return matched;
  }

  const walked = findContentRootFrom(process.cwd());
  if (walked) return walked;

  // Fallback for local dev.
  return path.join(process.cwd(), "content", "blog");
}

function isValidDate(value: string) {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

function isValidDateTime(value: string) {
  if (!DATETIME_PATTERN.test(value)) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function normalizeStatus(frontmatter: BlogPostFrontmatter) {
  if (frontmatter.status) return frontmatter.status;
  if (frontmatter.draft) return "draft";
  return "draft";
}

function normalizeLocale(value: unknown): Locale {
  return typeof value === "string" && isLocale(value) ? value : defaultLocale;
}

function normalizeAvailableLocales(frontmatter: BlogPostFrontmatter): Locale[] {
  const rawLocales = Array.isArray(frontmatter.availableLocales)
    ? frontmatter.availableLocales
    : [frontmatter.locale ?? defaultLocale];
  const locales = rawLocales.filter((locale): locale is Locale =>
    typeof locale === "string" && isLocale(locale)
  );

  return locales.length > 0 ? [...new Set(locales)] : [defaultLocale];
}

function applyLocaleOverride(post: BlogPost, locale: Locale): BlogPost {
  const override = localizedPostOverrides[post.slug]?.[locale];
  if (!override) return post;

  const cover =
    typeof post.cover === "string"
      ? post.cover
      : {
          ...post.cover,
          alt: override.coverAlt ?? post.cover.alt
        };
  const series = post.series
    ? {
        ...post.series,
        title: override.seriesTitle ?? post.series.title
      }
    : post.series;

  return {
    ...post,
    title: override.title,
    summary: override.summary,
    cover,
    seo: override.seo ?? post.seo,
    series,
    content: override.content,
    wordCount: getWordCount(override.content),
    readingTime: getReadingTime(override.content)
  };
}

function validateFrontmatter(frontmatter: BlogPostFrontmatter): ValidationResult {
  const errors: string[] = [];

  if (!frontmatter.title) errors.push("missing title");
  if (!frontmatter.slug) errors.push("missing slug");
  if (!frontmatter.date || !isValidDate(frontmatter.date)) errors.push("invalid date");
  if (!frontmatter.updatedAt || !isValidDate(frontmatter.updatedAt)) {
    errors.push("invalid updatedAt");
  }
  if (!frontmatter.summary) errors.push("missing summary");
  if (!frontmatter.cover) errors.push("missing cover");
  if (!frontmatter.author) errors.push("missing author");
  if (!isBlogTopicId(frontmatter.category)) errors.push("invalid category");

  const status = normalizeStatus(frontmatter);
  if (!STATUS_VALUES.includes(status)) errors.push("invalid status");

  if (status === "scheduled") {
    if (!frontmatter.publishDate || !isValidDateTime(frontmatter.publishDate)) {
      errors.push("invalid publishDate for scheduled status");
    }
  }

  if (frontmatter.series) {
    if (typeof frontmatter.series.id !== "string" || frontmatter.series.id.trim().length === 0) {
      errors.push("invalid series id");
    }
    if (
      typeof frontmatter.series.title !== "string" ||
      frontmatter.series.title.trim().length === 0
    ) {
      errors.push("invalid series title");
    }
    if (typeof frontmatter.series.order !== "number" || !Number.isFinite(frontmatter.series.order)) {
      errors.push("invalid series order");
    }
  }

  if (frontmatter.cover && typeof frontmatter.cover === "object") {
    if (!frontmatter.cover.alt) errors.push("cover alt is required");
    if (!frontmatter.cover.src) errors.push("cover src is required");
  }

  return { isValid: errors.length === 0, errors };
}

function getWordCount(content: string) {
  const plainContent = content.replace(/```[\s\S]*?```/g, "");
  const chineseChars = plainContent.match(/[\u4e00-\u9fa5]/g)?.length ?? 0;
  const englishWords = plainContent.match(/[a-zA-Z0-9]+/g)?.length ?? 0;
  return chineseChars + englishWords;
}

function getReadingTime(content: string) {
  const plainContent = content.replace(/```[\s\S]*?```/g, "");
  const chineseChars = plainContent.match(/[\u4e00-\u9fa5]/g)?.length ?? 0;
  const englishWords = plainContent.match(/[a-zA-Z0-9]+/g)?.length ?? 0;
  const minutes = chineseChars / 300 + englishWords / 200;
  return Math.max(1, Math.ceil(minutes));
}

function parsePost(filePath: string): BlogPost | null {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const frontmatter = data as BlogPostFrontmatter;
  const validation = validateFrontmatter(frontmatter);

  if (!validation.isValid) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[blog] invalid frontmatter in ${filePath}: ${validation.errors.join(", ")}`);
    }
    return null;
  }

  return {
    ...frontmatter,
    status: normalizeStatus(frontmatter),
    locale: normalizeLocale(frontmatter.locale),
    availableLocales: normalizeAvailableLocales(frontmatter),
    content,
    wordCount: getWordCount(content),
    readingTime: getReadingTime(content),
    filePath
  };
}

export function getAllPosts(): BlogPost[] {
  const contentRoot = getContentRoot();
  if (!fs.existsSync(contentRoot)) return [];

  const files = fs
    .readdirSync(contentRoot)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => path.join(contentRoot, file));

  const posts = files.map(parsePost).filter((post): post is BlogPost => Boolean(post));

  const slugSet = new Set<string>();
  const uniquePosts: BlogPost[] = [];

  for (const post of posts) {
    if (slugSet.has(post.slug)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[blog] duplicate slug detected: ${post.slug} (${post.filePath})`);
      }
      continue;
    }
    slugSet.add(post.slug);
    uniquePosts.push(post);
  }

  return uniquePosts.sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return a.title.localeCompare(b.title);
  });
}

export function isPublished(post: BlogPost, now = new Date()) {
  const status = normalizeStatus(post);
  if (status === "archived" || status === "draft") return false;
  if (status === "scheduled") {
    if (!post.publishDate) return false;
    return new Date(post.publishDate).getTime() <= now.getTime();
  }
  return true;
}

export function getPublishedPosts() {
  return getAllPosts().filter((post) => isPublished(post));
}

export function hasPostLocale(post: BlogPost, locale: Locale) {
  return (post.availableLocales ?? [post.locale ?? defaultLocale]).includes(locale);
}

export function getPublishedPostsForLocale(locale: Locale) {
  return getPublishedPosts()
    .filter((post) => hasPostLocale(post, locale))
    .map((post) => applyLocaleOverride(post, locale));
}

export function getPostBySlug(slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  return getAllPosts().find((post) => post.slug === decodedSlug) ?? null;
}

export function getPostBySlugForLocale(slug: string, locale: Locale) {
  const post = getPostBySlug(slug);
  return post && isPublished(post) && hasPostLocale(post, locale)
    ? applyLocaleOverride(post, locale)
    : null;
}
