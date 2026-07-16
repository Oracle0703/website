import { NextResponse } from "next/server";
import { getContactServiceReadiness } from "../../../../lib/contact-form";

export const dynamic = "force-dynamic";

export async function GET() {
  const readiness = await getContactServiceReadiness();

  return NextResponse.json(
    {
      ok: readiness.ready,
      ready: readiness.ready,
      service: "website-contact",
      version: "v4",
      checks: {
        persistence: readiness.persistence,
        notification: readiness.notification
      }
    },
    { status: readiness.ready ? 200 : 503 }
  );
}
