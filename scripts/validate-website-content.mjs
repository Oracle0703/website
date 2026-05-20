import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
const STATUSES = new Set(["draft", "published", "archived", "scheduled"]);
const LOCALES = new Set(["zh", "en"]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidDate(value) {
  if (!isNonEmptyString(value) || !DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime());
}

function isValidDateTime(value) {
  if (!isNonEmptyString(value) || !DATETIME_PATTERN.test(value)) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function normalizeStatus(frontmatter) {
  if (frontmatter.status) return frontmatter.status;
  if (frontmatter.draft) return "draft";
  return "draft";
}

function severityFor(status, field) {
  if (status === "published" || status === "scheduled") return "error";

  const requiredForAll = new Set(["title", "slug", "date", "updatedAt", "author", "status"]);
  return requiredForAll.has(field) ? "error" : "warning";
}

function addIssue(issues, severity, filePath, message) {
  issues.push({ severity, filePath, message });
}

function formatIssue(issue) {
  return `${issue.filePath}: ${issue.message}`;
}

function validateStringField(issues, filePath, frontmatter, status, field, message) {
  if (!isNonEmptyString(frontmatter[field])) {
    addIssue(issues, severityFor(status, field), filePath, message);
  }
}

function validateCover(issues, filePath, frontmatter, status) {
  if (typeof frontmatter.cover === "string") {
    if (!isNonEmptyString(frontmatter.cover)) {
      addIssue(issues, severityFor(status, "cover"), filePath, "cover src is required");
    }
    return;
  }

  if (!isPlainObject(frontmatter.cover)) {
    addIssue(issues, severityFor(status, "cover"), filePath, "cover is required");
    return;
  }

  if (!isNonEmptyString(frontmatter.cover.src)) {
    addIssue(issues, severityFor(status, "cover"), filePath, "cover src is required");
  }

  if (!isNonEmptyString(frontmatter.cover.alt)) {
    addIssue(issues, severityFor(status, "cover"), filePath, "cover alt is required");
  }
}

function validateArrayField(issues, filePath, frontmatter, status, field, message) {
  const value = frontmatter[field];
  if (!Array.isArray(value) || value.length === 0) {
    addIssue(issues, severityFor(status, field), filePath, message);
    return;
  }

  for (const item of value) {
    if (!isNonEmptyString(item)) {
      addIssue(issues, severityFor(status, field), filePath, `${field} contains an empty value`);
    }
  }
}

function validateSeo(issues, filePath, frontmatter, status) {
  if (!frontmatter.seo) return;
  if (!isPlainObject(frontmatter.seo)) {
    addIssue(issues, severityFor(status, "seo"), filePath, "seo must be an object");
    return;
  }

  if (
    Object.hasOwn(frontmatter.seo, "canonical") &&
    (!isNonEmptyString(frontmatter.seo.canonical) ||
      !/^https?:\/\//i.test(frontmatter.seo.canonical))
  ) {
    addIssue(issues, severityFor(status, "seo"), filePath, "seo.canonical must be an absolute URL");
  }
}

function validateSeries(issues, filePath, frontmatter, status) {
  if (!frontmatter.series) return;
  if (!isPlainObject(frontmatter.series)) {
    addIssue(issues, severityFor(status, "series"), filePath, "series must be an object");
    return;
  }

  if (!isNonEmptyString(frontmatter.series.id)) {
    addIssue(issues, severityFor(status, "series"), filePath, "invalid series id");
  }

  if (!isNonEmptyString(frontmatter.series.title)) {
    addIssue(issues, severityFor(status, "series"), filePath, "invalid series title");
  }

  if (typeof frontmatter.series.order !== "number" || !Number.isFinite(frontmatter.series.order)) {
    addIssue(issues, severityFor(status, "series"), filePath, "invalid series order");
  }
}

function validateLocaleAvailability(issues, filePath, frontmatter, status) {
  if (frontmatter.locale !== undefined && !LOCALES.has(frontmatter.locale)) {
    addIssue(issues, severityFor(status, "locale"), filePath, "locale must be zh or en");
  }

  if (frontmatter.availableLocales === undefined) return;

  if (!Array.isArray(frontmatter.availableLocales) || frontmatter.availableLocales.length === 0) {
    addIssue(issues, severityFor(status, "availableLocales"), filePath, "availableLocales must contain at least one locale");
    return;
  }

  const seen = new Set();
  for (const locale of frontmatter.availableLocales) {
    if (!LOCALES.has(locale)) {
      addIssue(issues, severityFor(status, "availableLocales"), filePath, `invalid availableLocales value: ${String(locale)}`);
      continue;
    }

    if (seen.has(locale)) {
      addIssue(issues, severityFor(status, "availableLocales"), filePath, `duplicate availableLocales value: ${locale}`);
    }
    seen.add(locale);
  }
}

function parsePost(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const status = normalizeStatus(data);
  return { filePath, frontmatter: data, status, content };
}

function validateSinglePost(post) {
  const { filePath, frontmatter, status, content } = post;
  const issues = [];

  validateStringField(issues, filePath, frontmatter, status, "title", "title is required");
  validateStringField(issues, filePath, frontmatter, status, "slug", "slug is required");
  validateStringField(issues, filePath, frontmatter, status, "author", "author is required");

  if (!isValidDate(frontmatter.date)) {
    addIssue(issues, severityFor(status, "date"), filePath, "date must be YYYY-MM-DD");
  }

  if (!isValidDate(frontmatter.updatedAt)) {
    addIssue(issues, severityFor(status, "updatedAt"), filePath, "updatedAt must be YYYY-MM-DD");
  }

  if (!STATUSES.has(status)) {
    addIssue(issues, "error", filePath, `invalid status: ${String(status)}`);
  }

  if (status === "scheduled" && !isValidDateTime(frontmatter.publishDate)) {
    addIssue(issues, "error", filePath, "publishDate must be YYYY-MM-DDTHH:mm:ss for scheduled posts");
  }

  validateStringField(issues, filePath, frontmatter, status, "summary", "summary is required");
  validateCover(issues, filePath, frontmatter, status);
  validateArrayField(issues, filePath, frontmatter, status, "tags", "tags must contain at least one item");
  validateStringField(issues, filePath, frontmatter, status, "category", "category is required");
  validateSeo(issues, filePath, frontmatter, status);
  validateSeries(issues, filePath, frontmatter, status);
  validateLocaleAvailability(issues, filePath, frontmatter, status);
  validateMdxImages(issues, filePath, content, status);

  return issues;
}

function validateMdxImages(issues, filePath, content, status) {
  const markdownImagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let markdownMatch;
  while ((markdownMatch = markdownImagePattern.exec(content)) !== null) {
    if (!isNonEmptyString(markdownMatch[1])) {
      addIssue(issues, severityFor(status, "mdxImage"), filePath, "mdx image alt is required");
    }
  }

  const jsxImagePattern = /<Image\b[\s\S]*?\/>/g;
  let jsxMatch;
  while ((jsxMatch = jsxImagePattern.exec(content)) !== null) {
    const imageTag = jsxMatch[0];
    const altMatch = imageTag.match(/\balt=(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{"([^"]*)"\}|\{'([^']*)'\})/);
    const alt = altMatch?.slice(1).find((value) => value !== undefined) ?? "";

    if (!isNonEmptyString(alt)) {
      addIssue(issues, severityFor(status, "mdxImage"), filePath, "mdx image alt is required");
    }
  }
}

function validateSlugUniqueness(posts) {
  const issues = [];
  const seen = new Map();

  for (const post of posts) {
    const slug = post.frontmatter.slug;
    if (!isNonEmptyString(slug)) continue;

    if (seen.has(slug)) {
      addIssue(
        issues,
        "error",
        post.filePath,
        `duplicate slug "${slug}" also used by ${seen.get(slug)}`
      );
      continue;
    }

    seen.set(slug, post.filePath);
  }

  return issues;
}

function validateRelatedPosts(posts) {
  const issues = [];
  const postsBySlug = new Map();

  for (const post of posts) {
    if (isNonEmptyString(post.frontmatter.slug)) {
      postsBySlug.set(post.frontmatter.slug, post);
    }
  }

  for (const post of posts) {
    const relatedPosts = post.frontmatter.relatedPosts;
    if (relatedPosts === undefined) continue;

    if (!Array.isArray(relatedPosts)) {
      addIssue(issues, severityFor(post.status, "relatedPosts"), post.filePath, "relatedPosts must be an array");
      continue;
    }

    for (const relatedSlug of relatedPosts) {
      if (!isNonEmptyString(relatedSlug)) {
        addIssue(issues, severityFor(post.status, "relatedPosts"), post.filePath, "relatedPosts contains an empty slug");
        continue;
      }

      if (relatedSlug === post.frontmatter.slug) {
        addIssue(issues, severityFor(post.status, "relatedPosts"), post.filePath, `relatedPosts cannot reference itself: ${relatedSlug}`);
        continue;
      }

      const related = postsBySlug.get(relatedSlug);
      if (!related) {
        addIssue(issues, severityFor(post.status, "relatedPosts"), post.filePath, `relatedPosts references missing slug: ${relatedSlug}`);
        continue;
      }

      if (post.status === "published" && related.status !== "published") {
        addIssue(
          issues,
          "error",
          post.filePath,
          `published relatedPosts reference "${relatedSlug}" with ${related.status} status`
        );
      }
    }
  }

  return issues;
}

function validateSeriesOrder(posts) {
  const issues = [];
  const ordersBySeries = new Map();

  for (const post of posts) {
    if (post.status !== "published") continue;
    const { series } = post.frontmatter;
    if (!isPlainObject(series)) continue;
    if (!isNonEmptyString(series.id)) continue;
    if (typeof series.order !== "number" || !Number.isFinite(series.order)) continue;

    const seriesOrders = ordersBySeries.get(series.id) ?? new Map();
    if (seriesOrders.has(series.order)) {
      addIssue(
        issues,
        "error",
        post.filePath,
        `${series.id} has duplicate series order ${series.order} also used by ${seriesOrders.get(series.order)}`
      );
    } else {
      seriesOrders.set(series.order, post.filePath);
    }
    ordersBySeries.set(series.id, seriesOrders);
  }

  return issues;
}

function listMdxFiles(contentDirectory) {
  if (!fs.existsSync(contentDirectory)) return [];
  return fs
    .readdirSync(contentDirectory)
    .filter((file) => file.endsWith(".mdx"))
    .sort()
    .map((file) => path.join(contentDirectory, file));
}

export function validateContentDirectory(contentDirectory = path.join(process.cwd(), "content", "blog")) {
  const absoluteDirectory = path.resolve(contentDirectory);
  const files = listMdxFiles(absoluteDirectory);
  const posts = [];
  const parseIssues = [];

  for (const filePath of files) {
    try {
      posts.push(parsePost(filePath));
    } catch (error) {
      addIssue(parseIssues, "error", filePath, `failed to parse frontmatter: ${error.message}`);
    }
  }

  const issues = [
    ...parseIssues,
    ...posts.flatMap(validateSinglePost),
    ...validateSlugUniqueness(posts),
    ...validateRelatedPosts(posts),
    ...validateSeriesOrder(posts)
  ];

  const errors = issues.filter((issue) => issue.severity === "error").map(formatIssue);
  const warnings = issues.filter((issue) => issue.severity === "warning").map(formatIssue);

  return {
    ok: errors.length === 0,
    filesChecked: files.length,
    errors,
    warnings
  };
}

function printResult(result) {
  if (result.errors.length > 0) {
    console.error("Website content validation errors:");
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
  }

  if (result.warnings.length > 0) {
    console.warn("Website content validation warnings:");
    for (const warning of result.warnings) {
      console.warn(`- ${warning}`);
    }
  }

  if (result.ok) {
    console.log(`Website content validation passed (${result.filesChecked} files checked).`);
  }
}

const currentFilePath = fileURLToPath(import.meta.url);
const invokedFilePath = process.argv[1] ? path.resolve(process.argv[1]) : "";

if (currentFilePath === invokedFilePath) {
  const contentDirectory = process.argv[2] ?? path.join(process.cwd(), "content", "blog");
  const result = validateContentDirectory(contentDirectory);
  printResult(result);
  process.exitCode = result.ok ? 0 : 1;
}
