import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";

const root = process.cwd();
const blogContentRoot = path.join(root, "content", "blog");
const minimumPublishedEnglishPosts = 3;

const cjkPattern = /[\u3400-\u9fff\uF900-\uFAFF]/g;
const allowedCjkExceptions = [
  "AI 页面分析助手",
  "修行打卡系统",
  "时间戳转换工具",
  "中文原创",
  "中文原文"
];

const audits = [
  {
    kind: "route-surface",
    route: "/en",
    file: "apps/website/app/en/page.tsx",
    maxCjkCharacters: 0
  },
  {
    kind: "route-surface",
    route: "/en/projects",
    file: "apps/website/app/en/projects/page.tsx",
    maxCjkCharacters: 0
  },
  {
    kind: "route-surface",
    route: "/en/projects/ai-page-analysis",
    file: "apps/website/app/en/projects/[slug]/page.tsx",
    maxCjkCharacters: 0
  },
  {
    kind: "route-surface",
    route: "/en/ai-page-analysis",
    file: "apps/website/app/en/ai-page-analysis/page.tsx",
    maxCjkCharacters: 0
  },
  {
    kind: "localized-source",
    route: "/en/projects",
    file: "apps/website/lib/projects.ts",
    maxCjkCharacters: 4_500,
    note: "Source keeps zh/en project copy, gallery evidence, architecture steps, and decisions together; English ProjectView is checked separately."
  },
  {
    kind: "localized-source",
    route: "/en/ai-page-analysis",
    file: "apps/website/components/landing/ai-page-analysis-landing-client.tsx",
    maxCjkCharacters: 1_800,
    note: "Source keeps zh/en landing copy together; English route-surface is checked separately."
  }
];

const englishViewAudits = [
  {
    kind: "project-view",
    label: "/en/projects",
    file: "apps/website/lib/projects.ts",
    start: "const englishProjectContentBySlug",
    end: "function getChineseProjectContent"
  },
  {
    kind: "blog-view",
    label: "/en/blog",
    file: "apps/website/lib/blog.ts",
    start: "const localizedPostOverrides",
    end: "function findContentRootFrom"
  }
];

function readAuditFile(audit) {
  const absolutePath = path.join(root, audit.file);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`${audit.file} does not exist`);
  }

  return fs.readFileSync(absolutePath, "utf8");
}

function removeAllowedExceptions(source) {
  return allowedCjkExceptions.reduce(
    (current, exception) => current.replaceAll(exception, ""),
    source
  );
}

function countCjkCharacters(source) {
  const normalized = removeAllowedExceptions(source);
  return normalized.match(cjkPattern)?.length ?? 0;
}

function countStrictCjkCharacters(source) {
  return source.match(cjkPattern)?.length ?? 0;
}

function getAvailableLocales(frontmatter) {
  if (Array.isArray(frontmatter.availableLocales) && frontmatter.availableLocales.length > 0) {
    return frontmatter.availableLocales;
  }

  return [typeof frontmatter.locale === "string" ? frontmatter.locale : "zh"];
}

function readBlogPosts() {
  if (!fs.existsSync(blogContentRoot)) return [];

  return fs
    .readdirSync(blogContentRoot)
    .filter((file) => file.endsWith(".mdx"))
    .sort()
    .map((file) => {
      const relativeFile = path.join("content", "blog", file);
      const raw = fs.readFileSync(path.join(root, relativeFile), "utf8");
      const { data, content } = matter(raw);

      return {
        file: relativeFile,
        frontmatter: data,
        content
      };
    });
}

function getNativeEnglishSource(post) {
  return `${JSON.stringify(post.frontmatter)}\n${post.content}`;
}

function formatResult(result) {
  const base = `${result.kind} ${result.route} ${result.file}: ${result.cjkCharacters}/${result.maxCjkCharacters} CJK`;
  return result.note ? `${base} (${result.note})` : base;
}

function extractSourceBlock(file, start, end) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    throw new Error(`Unable to extract ${start} from ${file}`);
  }

  return source.slice(startIndex, endIndex);
}

function runAudit() {
  const results = audits.map((audit) => {
    const source = readAuditFile(audit);
    return {
      ...audit,
      cjkCharacters: countCjkCharacters(source)
    };
  });

  const failures = results.filter((result) => result.cjkCharacters > result.maxCjkCharacters);
  const viewResults = englishViewAudits.map((audit) => {
    const source = extractSourceBlock(audit.file, audit.start, audit.end);
    return {
      ...audit,
      cjkCharacters: countCjkCharacters(source),
      maxCjkCharacters: 0
    };
  });
  const viewFailures = viewResults.filter((result) => result.cjkCharacters > result.maxCjkCharacters);
  const blogPosts = readBlogPosts();
  const publishedEnglishPosts = blogPosts.filter(
    (post) =>
      post.frontmatter.status === "published" &&
      getAvailableLocales(post.frontmatter).includes("en")
  );
  const nativeEnglishResults = publishedEnglishPosts
    .filter((post) => post.frontmatter.locale === "en")
    .map((post) => ({
      kind: "native-blog",
      route: `/en/blog/${post.frontmatter.slug}`,
      file: post.file,
      cjkCharacters: countStrictCjkCharacters(getNativeEnglishSource(post)),
      maxCjkCharacters: 0
    }));
  const nativeEnglishFailures = nativeEnglishResults.filter(
    (result) => result.cjkCharacters > result.maxCjkCharacters
  );
  const hasEnoughPublishedEnglishPosts =
    publishedEnglishPosts.length >= minimumPublishedEnglishPosts;

  console.log("Website English content audit");
  for (const result of results) {
    console.log(`- ${formatResult(result)}`);
  }
  for (const result of viewResults) {
    console.log(`- ${formatResult({ ...result, route: result.label })}`);
  }
  console.log(
    `- blog-count /en/blog content/blog: ${publishedEnglishPosts.length}/${minimumPublishedEnglishPosts} published English posts`
  );
  for (const result of nativeEnglishResults) {
    console.log(`- ${formatResult(result)}`);
  }

  if (
    failures.length > 0 ||
    viewFailures.length > 0 ||
    nativeEnglishFailures.length > 0 ||
    !hasEnoughPublishedEnglishPosts
  ) {
    console.error("\nEnglish content audit failed:");
    for (const failure of [...failures, ...viewFailures, ...nativeEnglishFailures]) {
      console.error(`- ${formatResult(failure)}`);
    }
    if (!hasEnoughPublishedEnglishPosts) {
      console.error(
        `- /en/blog exposes ${publishedEnglishPosts.length} published English posts; expected at least ${minimumPublishedEnglishPosts}`
      );
    }
    process.exitCode = 1;
  }
}

runAudit();
