import { IQR, IUser, qrCodes, users } from "@/lib/inMemoryStore";

/**
 * Finds an in-memory user by their ID.
 *
 * @param userId - The ID of the user to find.
 * @returns The user with the given ID, or undefined if no such user exists.
 */
export const findUserById = (userId: string) =>
  users.find((user) => user.id === userId);

/**
 * Finds an in-memory user by their Telegram ID.
 *
 * @param telegramId - The Telegram ID of the user to find.
 * @returns The user with the given Telegram ID, or undefined if no such user exists.
 */
export const findUserByTelegramId = (telegramId: string) =>
  users.find((user) => user.telegramId === telegramId);

/**
 * Creates an in-memory user and adds it to the store.
 *
 * @param user - The user data to create.
 * @returns The newly created user.
 */
export const createUser = (user: Omit<IUser, "id" | "createdAt">) => {
  const newUser = { ...user, id: Date.now().toString(), createdAt: new Date() };
  users.push(newUser);
  return newUser;
};

/**
 * Retrieves all QR codes associated with a specific user.
 *
 * @param userId - The ID of the user whose QR codes are to be found.
 * @returns An array of QR codes belonging to the specified user.
 */

export const findQrCodesOfUser = (userId: string) =>
  qrCodes.filter((qrCode) => qrCode.userId === userId);

/**
 * Creates an in-memory QR code and adds it to the store.
 *
 * @param qrCode - The QR code data to create.
 * @returns The newly created QR code.
 */
export const createQrCode = (qrCode: Omit<IQR, "id" | "createdAt">) => {
  const newQrCode = {
    ...qrCode,
    id: Date.now().toString(),
    createdAt: new Date(),
  };
  qrCodes.push(newQrCode);
  return newQrCode;
};

/**
 * Updates the wallet address of an in-memory user.
 *
 * @param userId - The ID of the user whose wallet address is to be updated.
 * @param newWalletAddress - The new wallet address to be assigned to the user.
 * @returns The updated user object.
 * @throws {Error} If no user is found with the given ID.
 */

export const updateUserWallet = (userId: string, newWalletAddress: string) => {
  const user = users.find((user) => user.id === userId);
  if (!user) {
    throw new Error("User not found");
  }

  user.walletAddress = newWalletAddress;
  return user;
};
