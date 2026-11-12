/**
 * Tagged SQL for local users keyed by id or Auth0 subject.
 * The mapper turns a row into the port `User`.
 */

import type { UserDb } from '@infrastructure/database/db-types';

import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for local users keyed by id or Auth0 subject.
 * The mapper turns a row into the port `User`.
 */

// A local user row appears on a player's first write (their first army). A
// concurrent duplicate insert violates the unique index on `user_auth_sub`, and
// `ensureByAuthSub` handles that by re-reading.
const createUserByAuthSubQuery = async (
  sql: Sql,
  authSub: string,
): Promise<UserDb[]> =>
  await sql`
    INSERT INTO users (user_auth_sub)
    VALUES (${authSub})
    RETURNING user_id, user_auth_sub
  `;

export { createUserByAuthSubQuery };
