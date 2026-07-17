import type { Metadata } from "next";
import "../globals.css";
import { RootDocument } from "../../components/root-document";
import { getRootMetadata } from "../../lib/root-metadata";

export const generateMetadata = (): Metadata => getRootMetadata("en");

export default function EnglishRootLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument locale="en">{children}</RootDocument>;
}
