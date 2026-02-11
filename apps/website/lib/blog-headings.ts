export type TocHeading = {
  depth: 2 | 3;
  id: string;
  title: string;
};

const FENCED_CODE_BLOCK_PATTERN = /```[\s\S]*?```/g;
const HEADING_PATTERN = /^\s{0,3}(#{2,3})\s+(.+?)\s*$/gm;

function stripMarkdownSyntax(value: string) {
  return value
    .replace(/\{#.*?\}\s*$/, "")
    .replace(/!\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[>*_~]/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

export function slugifyHeading(text: string) {
  const normalized = text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  const slug = normalized
    .replace(/[\s/]+/g, "-")
    .replace(/[^\p{Letter}\p{Number}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "section";
}

export function extractTocHeadings(content: string): TocHeading[] {
  const sanitizedContent = content.replace(FENCED_CODE_BLOCK_PATTERN, "");
  const headings: TocHeading[] = [];

  for (const match of sanitizedContent.matchAll(HEADING_PATTERN)) {
    const depth = match[1].length as 2 | 3;
    const title = stripMarkdownSyntax(match[2]);

    if (!title) continue;

    headings.push({
      depth,
      title,
      id: slugifyHeading(title)
    });
  }

  return headings;
}
