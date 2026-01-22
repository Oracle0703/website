import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

export const metadata: Metadata = {
  title: {
    default: "\u5f00\u53d1\u8005\u4e3b\u9875 | Developer Portfolio",
    template: "%s | Developer Portfolio"
  },
  description: "\u5c55\u793a\u535a\u5ba2\u3001\u5b9e\u9a8c\u5ba4\u4e0e\u6253\u5361\u5e73\u53f0\u7684\u4e2a\u4eba\u5f00\u53d1\u8005\u7f51\u7ad9\u3002",
  openGraph: {
    title: "\u5f00\u53d1\u8005\u4e3b\u9875",
    description: "\u5c55\u793a\u535a\u5ba2\u3001\u5b9e\u9a8c\u5ba4\u4e0e\u6253\u5361\u5e73\u53f0\u7684\u4e2a\u4eba\u5f00\u53d1\u8005\u7f51\u7ad9\u3002",
    type: "website",
    url: "/",
    images: ["/og.png"]
  },
  alternates: {
    canonical: "/"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="min-h-screen bg-base">
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
