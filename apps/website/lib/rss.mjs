const INVALID_XML_CHARACTERS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g;

const XML_ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;"
};

/**
 * @typedef {object} RssItem
 * @property {string} title
 * @property {string} url
 * @property {string} summary
 * @property {string} publishedAt
 * @property {string | undefined} [updatedAt]
 * @property {readonly string[] | undefined} [categories]
 */

/**
 * @typedef {object} RssFeed
 * @property {string} title
 * @property {string} description
 * @property {string} siteUrl
 * @property {string} feedUrl
 * @property {string} [language]
 * @property {readonly RssItem[]} items
 */

export function escapeXml(value) {
  return String(value)
    .replace(INVALID_XML_CHARACTERS, "")
    .replace(/[&<>"']/g, (character) => XML_ENTITIES[character]);
}

function requireAbsoluteHttpUrl(value, fieldName) {
  let url;

  try {
    url = new URL(value);
  } catch {
    throw new TypeError(`${fieldName} must be an absolute URL`);
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new TypeError(`${fieldName} must use http or https`);
  }

  return url.toString();
}

function toRssDate(value, fieldName) {
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T00:00:00.000Z`
    : value;
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    throw new TypeError(`${fieldName} must be a valid date`);
  }

  return date.toUTCString();
}

/**
 * Render an RSS 2.0 document from already-published, indexable posts.
 *
 * @param {RssFeed} feed
 */
export function renderRssFeed(feed) {
  const siteUrl = requireAbsoluteHttpUrl(feed.siteUrl, "siteUrl");
  const feedUrl = requireAbsoluteHttpUrl(feed.feedUrl, "feedUrl");
  const items = feed.items.map((item, index) => {
    const url = requireAbsoluteHttpUrl(item.url, `items[${index}].url`);
    const categories = (item.categories ?? [])
      .map((category) => `      <category>${escapeXml(category)}</category>`)
      .join("\n");

    return [
      "    <item>",
      `      <title>${escapeXml(item.title)}</title>`,
      `      <link>${escapeXml(url)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
      `      <description>${escapeXml(item.summary)}</description>`,
      `      <pubDate>${escapeXml(toRssDate(item.publishedAt, `items[${index}].publishedAt`))}</pubDate>`,
      categories,
      "    </item>"
    ]
      .filter(Boolean)
      .join("\n");
  });

  const newestUpdate = feed.items
    .map((item, index) =>
      toRssDate(item.updatedAt ?? item.publishedAt, `items[${index}].updatedAt`)
    )
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(feed.title)}</title>`,
    `    <link>${escapeXml(siteUrl)}</link>`,
    `    <description>${escapeXml(feed.description)}</description>`,
    `    <language>${escapeXml(feed.language ?? "zh-CN")}</language>`,
    `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />`,
    newestUpdate ? `    <lastBuildDate>${escapeXml(newestUpdate)}</lastBuildDate>` : "",
    "    <generator>Meaningful Ink</generator>",
    ...items,
    "  </channel>",
    "</rss>",
    ""
  ]
    .filter(Boolean)
    .join("\n");
}
