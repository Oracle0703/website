import type { Metadata } from "next";

// Next.js only auto-discovers the root manifest file. A segment-level metadata
// override keeps English pages linked to their localized install definition
// while the root layout continues to own all shared SEO metadata.
export const metadata: Metadata = {
  manifest: "/en/manifest.webmanifest"
};

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return children;
}
