import type { DataErrorSignature } from '@ports/data-error-signature-port';

/** Domain user entity. */
interface User {
  userId: string;
  authSub: string;
}

interface UserStorage {
  getByUserId: (userId: string) => Promise<DataErrorSignature<User>>;
  getByAuthSub: (authSub: string) => Promise<DataErrorSignature<User>>;
  /**
   * Resolve the user for an auth subject, creating one when none exists.
   * Implementations should make concurrent upserts safe.
   */
  ensureByAuthSub: (authSub: string) => Promise<DataErrorSignature<User>>;
}

export type { User, UserStorage };
