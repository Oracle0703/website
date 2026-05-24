import { NextResponse, type NextRequest } from "next/server";
import {
  appendContactSubmission,
  checkContactSubmissionGate,
  contactSubmissionGate,
  createContactSubmission,
  getContactIdentityKey,
  sendContactNotification,
  validateContactFormSubmission
} from "../../../lib/contact-form";

export const dynamic = "force-dynamic";

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function getErrorStatus(code: string) {
  if (code === "rate_limited") return 429;
  if (code === "storage_failure" || code === "submit_failure") return 500;
  return 400;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "website-contact",
    version: "d7"
  });
}

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        status: "failed",
        error: {
          code: "submit_failure",
          message: "Request body must be valid JSON."
        }
      },
      { status: 400 }
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
  const identityKey = getContactIdentityKey(ipAddress, validation.value.contact);
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
  if (!notification.ok) {
    return NextResponse.json(
      {
        status: "received_with_notification_failure",
        submission_id: submission.submissionId,
        error: {
          code: "notification_failure",
          message: "The request was saved, but notification delivery failed."
        }
      },
      { status: 202 }
    );
  }

  return NextResponse.json({
    status: "received",
    submission_id: submission.submissionId,
    message: "Your request was received."
  });
}
