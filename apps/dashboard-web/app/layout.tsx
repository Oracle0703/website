import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Meaningful Ink dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <div className="min-h-screen px-4 py-6">
          <div className="mx-auto w-full max-w-4xl">{children}</div>
        </div>
      </body>
    </html>
  );
}
