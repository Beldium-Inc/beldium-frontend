import { NextRequest, NextResponse } from "next/server";

const STAGING_BASE_URL = "https://stg-api.beldium.com";
const PRODUCTION_BASE_URL = "https://api.beldium.com";

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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ minerId: string }> },
) {
  const { minerId } = await context.params;
  const authorization = request.headers.get("authorization");
  const accessToken = request.headers.get("x-access-token");
  const authHeader = authorization ?? (accessToken ? `Bearer ${accessToken}` : null);

  try {
    const upstreamResponse = await fetch(
      `${getApiOrigin()}/compliance/miners/${minerId}/detail/`,
      {
        method: "GET",
        headers: authHeader ? { Authorization: authHeader } : undefined,
        cache: "no-store",
      },
    );

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
        message: "Unable to reach the miner detail service right now.",
      },
      { status: 502 },
    );
  }
}
