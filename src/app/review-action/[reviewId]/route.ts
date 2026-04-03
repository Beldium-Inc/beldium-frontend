import { NextRequest, NextResponse } from "next/server";

const STAGING_BASE_URL = "https://stg-api.beldium.com";
const PRODUCTION_BASE_URL = "https://api.beldium.com";

type ReviewAction = "approve" | "reject" | "start_review";

function getApiOrigin() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  switch (process.env.NEXT_PUBLIC_APP_ENV?.toLowerCase()) {
    case "production":
    case "prod":
      return PRODUCTION_BASE_URL;
    case "staging":
    case "stage":
    default:
      return STAGING_BASE_URL;
  }
}

function getActionPath(reviewId: string, action: ReviewAction) {
  switch (action) {
    case "approve":
      return `${getApiOrigin()}/compliance/reviews/${reviewId}/approve/`;
    case "reject":
      return `${getApiOrigin()}/compliance/reviews/${reviewId}/reject/`;
    case "start_review":
      return `${getApiOrigin()}/compliance/reviews/${reviewId}/start_review/`;
    default:
      return null;
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ reviewId: string }> },
) {
  const { reviewId } = await context.params;
  const authorization = request.headers.get("authorization");
  const accessToken = request.headers.get("x-access-token");
  const authHeader = authorization ?? (accessToken ? `Bearer ${accessToken}` : null);

  let action: ReviewAction | undefined;
  let reason: string | undefined;

  try {
    const parsedBody = (await request.json()) as {
      action?: ReviewAction;
      reason?: string;
    };
    action = parsedBody.action;
    reason = parsedBody.reason;
  } catch {
    action = undefined;
  }

  if (!action) {
    return NextResponse.json(
      {
        status: "error",
        message: "Review action is required.",
      },
      { status: 400 },
    );
  }

  const actionPath = getActionPath(reviewId, action);

  if (!actionPath) {
    return NextResponse.json(
      {
        status: "error",
        message: "Unsupported review action.",
      },
      { status: 400 },
    );
  }

  try {
    const upstreamResponse = await fetch(actionPath, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body:
        action === "reject"
          ? JSON.stringify({ reason: reason?.trim() || "Not Okay" })
          : undefined,
      cache: "no-store",
    });

    const responseText = await upstreamResponse.text();

    try {
      const responseJson = JSON.parse(responseText);
      return NextResponse.json(responseJson, {
        status: upstreamResponse.status,
      });
    } catch {
      return new NextResponse(responseText, {
        status: upstreamResponse.status,
        headers: {
          "Content-Type":
            upstreamResponse.headers.get("content-type") ?? "text/plain",
        },
      });
    }
  } catch {
    return NextResponse.json(
      {
        status: "error",
        data: null,
        message: "Unable to reach the review workflow service right now.",
      },
      { status: 502 },
    );
  }
}
