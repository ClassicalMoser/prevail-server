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
   * Resolve the user for an Auth0 `sub`, inserting a row when none exists.
   * Prefer a UNIQUE index on `users.user_auth_sub` for concurrent safety.
   */
  ensureByAuthSub: (authSub: string) => Promise<DataErrorSignature<User>>;
}

export type { User, UserStorage };
