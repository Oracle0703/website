import type { Metadata } from "next";
import "../globals.css";
import { RootDocument } from "../../components/root-document";
import { getRootMetadata } from "../../lib/root-metadata";

export const generateMetadata = (): Metadata => getRootMetadata("zh");

export default function ChineseRootLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument locale="zh">{children}</RootDocument>;
}
