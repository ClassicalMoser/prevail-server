import type { User } from '@ports';
import type { UserDb } from '../db-types';

/**
 * Map a user row into the persistence-agnostic user.
 *
 * @param row - `users` row.
 * @returns Domain user with the auth subject kept as an identifier, not a token.
 */
const userMapperToDomain = (row: UserDb): User => {
  const user: User = {
    userId: row.user_id,
    authSub: row.user_auth_sub,
  };
  return user;
};

export { userMapperToDomain };
