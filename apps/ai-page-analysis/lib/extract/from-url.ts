export type ExtractedUrlContent = {
  url: string;
  title?: string;
  description?: string;
  headings: string[];
  ctas: string[];
};

function matchContent(html: string, regex: RegExp) {
  const match = html.match(regex);
  return match?.[1]?.trim();
}

function collectTagTexts(html: string, tag: string, limit = 8) {
  const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, "gims");
  const values: string[] = [];
  for (const match of html.matchAll(regex)) {
    const text = match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (text) values.push(text);
    if (values.length >= limit) break;
  }
  return values;
}

export async function extractFromUrl(url: string): Promise<ExtractedUrlContent> {
  const response = await fetch(url, { cache: "no-store" });
  const html = await response.text();

  return {
    url,
    title: matchContent(html, /<title[^>]*>(.*?)<\/title>/is),
    description: matchContent(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/is),
    headings: [...collectTagTexts(html, "h1", 3), ...collectTagTexts(html, "h2", 5)].slice(0, 8),
    ctas: [...collectTagTexts(html, "button", 4), ...collectTagTexts(html, "a", 6)].slice(0, 8)
  };
}
