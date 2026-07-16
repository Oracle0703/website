import { getSiteSearchIndex } from "../../lib/site-search";

export const dynamic = "force-static";
export const revalidate = false;

export function GET() {
  return Response.json(
    {
      version: 1,
      entries: getSiteSearchIndex()
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, must-revalidate",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow"
      }
    }
  );
}
