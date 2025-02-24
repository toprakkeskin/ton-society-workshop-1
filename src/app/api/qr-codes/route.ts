import { currentUser } from "@/lib/auth";
import { createQrCode, findQrCodesOfUser } from "@/lib/inMemoryClient";
import { NextRequest, NextResponse } from "next/server";

/**
 * Get all QR codes of the current user.
 * @param  req - The incoming request.
 * @returns- The response containing the QR codes in JSON format.
 */
export async function GET(req: Request) {
  try {
    const user = await currentUser(req as NextRequest);
    const qrCodes = findQrCodesOfUser(user?.id!);

    return NextResponse.json(qrCodes, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error processing request", error },
      { status: 500 }
    );
  }
}

/**
 * Creates a new QR code for the current user.
 * @param  req - The incoming request.
 * @returns- The response containing the newly created QR code in JSON format.
 */
export async function POST(req: Request) {
  try {
    const user = await currentUser(req as NextRequest);
    const { value } = await req.json(); // Extract `value` field

    if (!value) {
      return NextResponse.json({ message: "Missing value" }, { status: 400 });
    }

    const createdQrCode = createQrCode({ userId: user?.id!, value });

    return NextResponse.json(createdQrCode, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error processing request", error },
      { status: 500 }
    );
  }
}
