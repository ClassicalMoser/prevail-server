/**
 * Tagged SQL for local users keyed by id or Auth0 subject.
 * The mapper turns a row into the port `User`.
 */

import type {
  UserDb,
} from '@infrastructure/database/db-types';

import type {
  Sql,
} from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for local users keyed by id or Auth0 subject.
 * The mapper turns a row into the port `User`.
 */

const getUserByIdQuery = async (sql: Sql, userId: string): Promise<UserDb[]> =>
  await sql`
    SELECT user_id, user_auth_sub
    FROM users
    WHERE user_id = ${userId}
    LIMIT 1
  `;

export { getUserByIdQuery };
