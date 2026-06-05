// Canonical public profile links for the site.
//
// Fill in the REAL profile URLs to activate each link. Empty entries are not
// rendered anywhere, so no placeholder/broken links appear until a real URL is
// set. This is the single source of truth the About page reads, and the site
// footer should adopt it too (replacing its hardcoded github.com/x.com/linkedin.com
// placeholders — see P0 "real social links").
export type SiteProfileLink = {
  label: string;
  href: string;
};

export const siteProfileLinks: SiteProfileLink[] = [
  { label: "GitHub", href: "" }, // TODO: e.g. https://github.com/<username>
  { label: "X", href: "" }, // TODO: e.g. https://x.com/<username>
  { label: "LinkedIn", href: "" } // TODO: e.g. https://www.linkedin.com/in/<username>
];

// Only the links that have a real URL set — safe to map over for rendering.
export function getActiveProfileLinks(): SiteProfileLink[] {
  return siteProfileLinks.filter((link) => link.href.trim().length > 0);
}
