import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userID = searchParams.get("userID");
    const roomID = searchParams.get("roomID");

    if (!userID || !roomID) {
      return new NextResponse(JSON.stringify({ error: "Missing parameters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || "");
    const secret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || "";

    if (isNaN(appID)) {
      console.error("ZEGO_APP_ID is not a valid number");
      return new NextResponse(JSON.stringify({ error: "Invalid App ID" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!secret) {
      console.error("ZEGO_SERVER_SECRET is missing");
      return new NextResponse(
        JSON.stringify({ error: "Missing Server Secret" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const payloadObject = {
      room_id: roomID,
      privilege: {
        1: 1, // loginRoom: 1 pass
        2: 0, // publishStream: 0 not pass (adjust as needed)
      },
      stream_id_list: null,
    };
    const payload = JSON.stringify(payloadObject);

    const effectiveTimeInSeconds = 3600; // 1 hour

    const token = generateToken(
      appID,
      userID,
      secret,
      effectiveTimeInSeconds,
      payload
    );

    return new NextResponse(JSON.stringify({ token }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Token API error:", error);
    return new NextResponse(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Token generation failed",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

function generateToken(
  appID: number,
  userID: string,
  secret: string,
  effectiveTimeInSeconds: number,
  payload: string
): string {
  const currentTime = Math.floor(Date.now() / 1000);
  const expiryTime = currentTime + effectiveTimeInSeconds;

  const message = `${appID}${userID}${expiryTime}${payload}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("hex");

  // Construct the token (replace with the *actual* format from Zego's docs)
  // This is a *placeholder*. Consult Zego's documentation for the exact format.
  const token = `04${Buffer.from(`${expiryTime}`).toString(
    "base64"
  )}${Buffer.from(signature).toString("base64")}`; // Example

  return token;
}
