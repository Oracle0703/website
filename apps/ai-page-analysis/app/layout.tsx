import type { Metadata } from "next";
import "./globals.css";
import { appBaseUrl, appDescription, appName } from "../lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(appBaseUrl),
  title: {
    default: appName,
    template: `%s | ${appName}`
  },
  description: appDescription,
  openGraph: {
    title: appName,
    description: appDescription,
    type: "website",
    url: appBaseUrl
  },
  twitter: {
    card: "summary_large_image",
    title: appName,
    description: appDescription
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
