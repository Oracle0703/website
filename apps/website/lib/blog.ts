import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

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

export interface BlogPostFrontmatter {
  title: string;
  slug: string;
  date: string;
  updatedAt: string;
  summary: string;
  cover: string | CoverImage;
  author: string;
  tags?: string[];
  category?: string;
  status?: PostStatus;
  publishDate?: string;
  draft?: boolean;
  seo?: SEOConfig;
  type?: "article" | "tutorial" | "note" | "translation" | "announcement";
  relatedPosts?: string[];
  comments?: { enabled: boolean; provider?: string };
}

export type BlogPost = BlogPostFrontmatter & {
  content: string;
  wordCount: number;
  readingTime: number;
  filePath: string;
};

type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
const STATUS_VALUES: PostStatus[] = ["draft", "published", "archived", "scheduled"];

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

  const status = normalizeStatus(frontmatter);
  if (!STATUS_VALUES.includes(status)) errors.push("invalid status");

  if (status === "scheduled") {
    if (!frontmatter.publishDate || !isValidDateTime(frontmatter.publishDate)) {
      errors.push("invalid publishDate for scheduled status");
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

export function getPostBySlug(slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  return getAllPosts().find((post) => post.slug === decodedSlug) ?? null;
}
