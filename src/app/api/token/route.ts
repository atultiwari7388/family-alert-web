//new code

import { NextRequest, NextResponse } from "next/server";
import { createCipheriv, randomBytes } from "crypto";

// Enums and interface for error handling (from Zego example)
const enum ErrorCode {
  success = 0,
  appIDInvalid = 1,
  userIDInvalid = 3,
  secretInvalid = 5,
  effectiveTimeInSecondsInvalid = 6,
}

const enum AesEncryptMode {
  CBCPKCS5Padding = 0,
  GCM = 1,
}

interface ErrorInfo {
  errorCode: ErrorCode;
  errorMessage: string;
}

// Helper functions (from Zego example)
function makeNonce(): number {
  const min = -Math.pow(2, 31);
  const max = Math.pow(2, 31) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function aesGcmEncrypt(
  plainText: string,
  key: string
): { encryptBuf: Buffer; nonce: Buffer } {
  if (![16, 24, 32].includes(key.length)) {
    throw createError(
      ErrorCode.secretInvalid,
      "Invalid Secret length. Key must be 16, 24, or 32 bytes."
    );
  }
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, nonce);
  cipher.setAutoPadding(true);
  const encrypted = cipher.update(plainText, "utf8");
  const encryptBuf = Buffer.concat([
    encrypted,
    cipher.final(),
    cipher.getAuthTag(),
  ]);

  return { encryptBuf, nonce };
}

function createError(errorCode: number, errorMessage: string): ErrorInfo {
  return {
    errorCode,
    errorMessage,
  };
}

// Token generation function (from Zego example)
function generateToken04(
  appId: number,
  userId: string,
  secret: string,
  effectiveTimeInSeconds: number,
  payload?: string
): string {
  if (!appId || typeof appId !== "number") {
    throw createError(ErrorCode.appIDInvalid, "appID invalid");
  }

  if (!userId || typeof userId !== "string" || userId.length > 64) {
    throw createError(ErrorCode.userIDInvalid, "userId invalid");
  }

  if (!secret || typeof secret !== "string" || secret.length !== 32) {
    throw createError(
      ErrorCode.secretInvalid,
      "secret must be a 32 byte string"
    );
  }

  if (!(effectiveTimeInSeconds > 0)) {
    throw createError(
      ErrorCode.effectiveTimeInSecondsInvalid,
      "effectiveTimeInSeconds invalid"
    );
  }

  const VERSION_FLAG = "04";

  const createTime = Math.floor(new Date().getTime() / 1000);
  const tokenInfo = {
    app_id: appId,
    user_id: userId,
    nonce: makeNonce(),
    ctime: createTime,
    expire: createTime + effectiveTimeInSeconds,
    payload: payload || "",
  };

  const plaintText = JSON.stringify(tokenInfo);

  const { encryptBuf, nonce } = aesGcmEncrypt(plaintText, secret);

  const [b1, b2, b3, b4] = [
    new Uint8Array(8),
    new Uint8Array(2),
    new Uint8Array(2),
    new Uint8Array(1),
  ];
  new DataView(b1.buffer).setBigInt64(0, BigInt(tokenInfo.expire), false);
  new DataView(b2.buffer).setUint16(0, nonce.byteLength, false);
  new DataView(b3.buffer).setUint16(0, encryptBuf.byteLength, false);
  new DataView(b4.buffer).setUint8(0, AesEncryptMode.GCM);

  const buf = Buffer.concat([
    Buffer.from(b1),
    Buffer.from(b2),
    Buffer.from(nonce),
    Buffer.from(b3),
    Buffer.from(encryptBuf),
    Buffer.from(b4),
  ]);

  const dv = new DataView(Uint8Array.from(buf).buffer);

  return VERSION_FLAG + Buffer.from(dv.buffer).toString("base64");
}

// Next.js API route
// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const userID = searchParams.get("userID");
//     const roomID = searchParams.get("roomID");

//     if (!userID || !roomID) {
//       return new NextResponse(JSON.stringify({ error: "Missing parameters" }), {
//         status: 400,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || "");
//     const secret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || "";

//     if (isNaN(appID)) {
//       console.error("ZEGO_APP_ID is not a valid number");
//       return new NextResponse(JSON.stringify({ error: "Invalid App ID" }), {
//         status: 500,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     if (!secret || secret.length !== 32) {
//       // Check secret length
//       console.error("ZEGO_SERVER_SECRET is missing or invalid");
//       return new NextResponse(
//         JSON.stringify({ error: "Missing or Invalid Server Secret" }),
//         {
//           status: 500,
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//     }

//     const payloadObject = {
//       room_id: roomID,
//       privilege: { 1: 1, 2: 0 },
//       stream_id_list: null,
//     };
//     const payload = JSON.stringify(payloadObject);

//     const effectiveTimeInSeconds = 3600;

//     const token = generateToken04(
//       appID,
//       userID,
//       secret,
//       effectiveTimeInSeconds,
//       payload
//     );

//     console.log("Generated Token:", token); // Log the generated token

//     return new NextResponse(JSON.stringify({ token }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error: unknown) {
//     console.error("Token API error:", error);
//     return new NextResponse(
//       JSON.stringify({
//         error:
//           error instanceof Error ? error.message : "Token generation failed",
//       }),
//       {
//         status: 500,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//   }
// }

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userID = searchParams.get("userID");
    const roomID = searchParams.get("roomID");

    // Enhanced validation
    if (!userID || !roomID) {
      return new NextResponse(
        JSON.stringify({ error: "Missing userID or roomID" }),
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(userID)) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid userID format" }),
        { status: 400 }
      );
    }

    const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || "");
    const secret = process.env.ZEGO_SERVER_SECRET || "";

    if (isNaN(appID)) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid App ID configuration" }),
        { status: 500 }
      );
    }

    if (secret.length !== 32) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid server secret configuration" }),
        { status: 500 }
      );
    }

    const payloadObject = {
      room_id: roomID,
      privilege: {
        1: 1, // Enable login
        2: 1, // Enable publish
      },
      stream_id_list: null,
    };

    const effectiveTimeInSeconds = 3600 * 24; // 24 hours
    const token = generateToken04(
      appID,
      userID,
      secret,
      effectiveTimeInSeconds,
      JSON.stringify(payloadObject)
    );

    return NextResponse.json({ token });
  } catch (error: unknown) {
    console.error("Token generation error:", error);
    if (
      error instanceof Error &&
      "errorCode" in error &&
      "errorMessage" in error
    ) {
      const zegoError = {
        errorCode: error.errorCode as ErrorCode,
        errorMessage: error.errorMessage as string,
      };
      return NextResponse.json(zegoError, { status: 500 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

//previous code
// import { NextRequest, NextResponse } from "next/server";
// import crypto from "crypto";

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const userID = searchParams.get("userID");
//     const roomID = searchParams.get("roomID");

//     if (!userID || !roomID) {
//       return new NextResponse(JSON.stringify({ error: "Missing parameters" }), {
//         status: 400,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || "");
//     const secret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || "";

//     if (isNaN(appID)) {
//       console.error("ZEGO_APP_ID is not a valid number");
//       return new NextResponse(JSON.stringify({ error: "Invalid App ID" }), {
//         status: 500,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     if (!secret) {
//       console.error("ZEGO_SERVER_SECRET is missing");
//       return new NextResponse(
//         JSON.stringify({ error: "Missing Server Secret" }),
//         { status: 500, headers: { "Content-Type": "application/json" } }
//       );
//     }

//     const payloadObject = {
//       room_id: roomID,
//       privilege: {
//         1: 1, // loginRoom: 1 pass
//         2: 0, // publishStream: 0 not pass (adjust as needed)
//       },
//       stream_id_list: null,
//     };
//     const payload = JSON.stringify(payloadObject);

//     const effectiveTimeInSeconds = 3600; // 1 hour

//     const token = generateToken(
//       appID,
//       userID,
//       secret,
//       effectiveTimeInSeconds,
//       payload
//     );

//     return new NextResponse(JSON.stringify({ token }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error: unknown) {
//     console.error("Token API error:", error);
//     return new NextResponse(
//       JSON.stringify({
//         error:
//           error instanceof Error ? error.message : "Token generation failed",
//       }),
//       {
//         status: 500,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//   }
// }

// function generateToken(
//   appID: number,
//   userID: string,
//   secret: string,
//   effectiveTimeInSeconds: number,
//   payload: string
// ): string {
//   const currentTime = Math.floor(Date.now() / 1000);
//   const expiryTime = currentTime + effectiveTimeInSeconds;

//   const message = `${appID}${userID}${expiryTime}${payload}`;
//   const signature = crypto
//     .createHmac("sha256", secret)
//     .update(message)
//     .digest("hex");

//   // Construct the token (replace with the *actual* format from Zego's docs)
//   // This is a *placeholder*. Consult Zego's documentation for the exact format.
//   const token = `04${Buffer.from(`${expiryTime}`).toString(
//     "base64"
//   )}${Buffer.from(signature).toString("base64")}`; // Example

//   return token;
// }
