import { findUserById } from "@/lib/inMemoryClient";
import { IUser } from "@/lib/inMemoryStore";
import { verify } from "jsonwebtoken";
import { NextRequest } from "next/server";

/**
 * Return the current user if they are authenticated and found in the store.
 * Throw an Error if the user can not be authenticated.
 *
 * @param req The request object.
 * @returns The current user if authenticated, undefined otherwise.
 * @throws Can not authenticate user
 */
export const currentUser = async (
  req: NextRequest
): Promise<IUser | undefined> => {
  const token = req.cookies.get("access_token")?.value || "";

  const decoded = verify(token, "secret", { complete: true });
  if (decoded?.payload) {
    return findUserById(decoded.payload.sub as string);
  }
  throw new Error("Can not authenticate user");
};
