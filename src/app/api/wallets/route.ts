import { currentUser } from "@/lib/auth";
import { updateUserWallet } from "@/lib/inMemoryClient";
import { NextRequest, NextResponse } from "next/server";

/**
 * Updates the wallet address of an in-memory user.
 *
 * @param req - The incoming request.
 * @returns The updated user object.
 */
export async function PATCH(req: Request) {
  try {
    const user = await currentUser(req as NextRequest);
    const { walletAddress } = await req.json(); // Extract `value` field

    if (!walletAddress) {
      return NextResponse.json(
        { message: "Missing walletAddress value" },
        { status: 400 }
      );
    }

    const updatedUser = updateUserWallet(user?.id!, walletAddress);

    return NextResponse.json(updatedUser, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error processing request", error },
      { status: 500 }
    );
  }
}
