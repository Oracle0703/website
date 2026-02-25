import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Meaningful Ink dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body className="overflow-hidden">
        <div className="h-dvh w-full overflow-hidden">{children}</div>
      </body>
    </html>
  );
}
