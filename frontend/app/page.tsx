import { HomePageClient } from "../components/home/home-page-client";

export const metadata = {
  title: "\u5f00\u53d1\u8005\u4e3b\u9875 | Developer Portfolio",
  description: "\u5c55\u793a\u535a\u5ba2\u3001\u5b9e\u9a8c\u5ba4\u4e0e\u6253\u5361\u5e73\u53f0\u7684\u4e2a\u4eba\u5f00\u53d1\u8005\u7f51\u7ad9\u3002"
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Developer Studio",
      url: "/",
      description: "\u5c55\u793a\u535a\u5ba2\u3001\u5b9e\u9a8c\u5ba4\u4e0e\u6253\u5361\u5e73\u53f0\u7684\u4e2a\u4eba\u5f00\u53d1\u8005\u7f51\u7ad9\u3002",
      inLanguage: "zh-CN"
    },
    {
      "@type": "Person",
      name: "Developer Studio",
      jobTitle: "Full-Stack Developer",
      url: "/"
    }
  ]
};

export default function HomePage() {
  return (
    <>
      <HomePageClient />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
