import type { Metadata } from "next";
import { LandingClient } from "../components/landing/landing-client";
import { appDescription, appName, toAbsoluteUrl } from "../lib/site";

export const metadata: Metadata = {
  title: appName,
  description: appDescription,
  alternates: {
    canonical: toAbsoluteUrl("/")
  }
};

export default function HomePage() {
  return <LandingClient />;
}
