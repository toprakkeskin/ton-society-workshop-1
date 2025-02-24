import { createUser, findUserByTelegramId } from "@/lib/inMemoryClient";
import { validate3rd } from "@telegram-apps/init-data-node/web";
import { parseInitData } from "@telegram-apps/sdk-react";
import { sign as signJwt } from "jsonwebtoken";
import { NextResponse } from "next/server";

/**
 * Authenticate with Telegram
 * This endpoint is used to authenticate a user and generate a JWT token.
 * The request body should contain a `tgInitData` property with the Telegram Init Data.
 * @param req - The incoming request.
 * @returns A JSON response with the authentication result.
 * @throws Error if the request is invalid or the user can not be authenticated.
 */
export async function POST(req: Request) {
  try {
    // Get Request Body
    const { tgInitData, startParam } = await req.json();
    const rawInitData = (tgInitData as string) || "";

    // Get Bot ID from Env
    const botId = Number(process.env.TG_BOT_ID || 0);

    // Validate Telegram Init Data
    if (process.env.NODE_ENV === "production") {
      await validate3rd(rawInitData, botId);
    }

    // Parse Telegram Init Data to obtain user data
    const initData = parseInitData(rawInitData);
    if (!initData || !initData?.user?.id) {
      throw Error("Invalid init data");
    }

    const telegramId = initData.user.id.toString();

    // Find or Create User
    let user = findUserByTelegramId(telegramId);
    if (!user) {
      // Check if there is referrer
      let referrerId;
      if (startParam?.startsWith("ref_")) {
        referrerId = startParam.split("ref_")[1];
      }
      console.log({ startParam, referrerId });
      user = createUser({
        telegramId,
        referrerId,
      });
    }

    if (!user) {
      throw Error("Can not authenticate user!");
    }

    // Generate JWT
    const jwt = signJwt(
      {
        sub: user.id,
      },
      "secret",
      { expiresIn: "24h" }
    );

    // Create Response & Set Cookie
    const response = NextResponse.json({
      message: "Successfully logged in",
      success: true,
      user: user,
    });

    response.cookies.set("access_token", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Error processing request", error },
      { status: 500 }
    );
  }
}
