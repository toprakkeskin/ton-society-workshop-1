/**
 * In-memory store for QR codes
 */
export interface IQR {
  id: string;
  userId: string;
  value: string;
  createdAt: Date;
}

/**
 * In-memory store for users
 */
export interface IUser {
  id: string;
  walletAddress?: string;
  telegramId: string;
  referrerId?: string;
  createdAt: Date;
}

// Use a global variable to persist across hot reloads
const globalStore = global as unknown as {
  users: IUser[];
  qrCodes: IQR[];
};

// Initialize the store
if (!globalStore.users) globalStore.users = [];
if (!globalStore.qrCodes) globalStore.qrCodes = [];

// Export the store
export const users = globalStore.users;
export const qrCodes = globalStore.qrCodes;
