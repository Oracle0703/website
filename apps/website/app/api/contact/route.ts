import { NextResponse, type NextRequest } from "next/server";
import {
  appendContactSubmission,
  checkContactSubmissionGate,
  ContactPayloadTooLargeError,
  contactSubmissionGate,
  createContactSubmission,
  getContactIdentityKey,
  getContactServiceReadiness,
  readContactRequestJson,
  rollbackContactSubmissionGate,
  sendContactNotification,
  validateContactFormSubmission
} from "../../../lib/contact-form";

export const dynamic = "force-dynamic";

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-real-ip")?.split(",")[0]?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ||
    "unknown"
  );
}

function getErrorStatus(code: string) {
  if (code === "rate_limited") return 429;
  if (code === "storage_failure" || code === "submit_failure") return 500;
  return 400;
}

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

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await readContactRequestJson(request);
  } catch (error) {
    const payloadTooLarge = error instanceof ContactPayloadTooLargeError;
    return NextResponse.json(
      {
        status: "failed",
        error: {
          code: "submit_failure",
          message: payloadTooLarge
            ? "Request body is too large."
            : "Request body must be valid JSON."
        }
      },
      { status: payloadTooLarge ? 413 : 400 }
    );
  }

  const validation = validateContactFormSubmission(payload ?? {});
  if (!validation.ok) {
    return NextResponse.json(
      {
        status: "failed",
        error: validation.error
      },
      { status: getErrorStatus(validation.error.code) }
    );
  }

  const ipAddress = getClientIp(request);
  const identityKey = getContactIdentityKey(ipAddress);
  const gateResult = checkContactSubmissionGate(contactSubmissionGate, {
    contact: validation.value.contact,
    projectGoal: validation.value.projectGoal,
    identityKey
  });

  if (!gateResult.ok) {
    return NextResponse.json(
      {
        status: "failed",
        error: gateResult.error
      },
      { status: getErrorStatus(gateResult.error.code) }
    );
  }

  const submission = createContactSubmission(validation.value, {
    ipAddress,
    userAgent: request.headers.get("user-agent") ?? ""
  });

  try {
    await appendContactSubmission(submission);
  } catch {
    rollbackContactSubmissionGate(contactSubmissionGate, gateResult.reservation);
    return NextResponse.json(
      {
        status: "failed",
        error: {
          code: "storage_failure",
          message: "The request could not be saved. Please retry later."
        }
      },
      { status: 500 }
    );
  }

  const notification = await sendContactNotification(submission);
  if (notification.status === "failed") {
    return NextResponse.json(
      {
        status: "received_with_notification_failure",
        submission_id: submission.submissionId,
        persistence_status: "saved",
        notification_status: "failed",
        error: {
          code: "notification_failure",
          message: "The request was saved, but automatic notification delivery failed."
        }
      },
      { status: 202 }
    );
  }

  if (notification.status === "skipped") {
    return NextResponse.json(
      {
        status: "received_without_notification",
        submission_id: submission.submissionId,
        persistence_status: "saved",
        notification_status: "skipped",
        message: "The request was saved. Automatic notification is not configured."
      },
      { status: 202 }
    );
  }

  return NextResponse.json({
    status: "received",
    submission_id: submission.submissionId,
    persistence_status: "saved",
    notification_status: "delivered",
    message: "The request was saved and its automatic notification was delivered."
  });
}
