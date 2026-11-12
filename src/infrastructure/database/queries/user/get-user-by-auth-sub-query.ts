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

// The Auth0 `sub` is the only identity a verified token carries, so this is how
// every signed-in request finds its local user. LIMIT 1 is safe because
// `user_auth_sub` has a unique index.
const getUserByAuthSubQuery = async (
  sql: Sql,
  authSub: string,
): Promise<UserDb[]> =>
  await sql`
    SELECT user_id, user_auth_sub
    FROM users
    WHERE user_auth_sub = ${authSub}
    LIMIT 1
  `;

export { getUserByAuthSubQuery };
