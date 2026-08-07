import type { UserDb } from '../db-types';
import type { Sql } from '../sql-type';

const getUserByIdQuery = async (
  sql: Sql,
  userId: string,
): Promise<UserDb[]> =>
  await sql`
    SELECT user_id, user_auth_sub
    FROM users
    WHERE user_id = ${userId}
    LIMIT 1
  `;

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

const createUserByAuthSubQuery = async (
  sql: Sql,
  authSub: string,
): Promise<UserDb[]> =>
  await sql`
    INSERT INTO users (user_auth_sub)
    VALUES (${authSub})
    RETURNING user_id, user_auth_sub
  `;

export {
  createUserByAuthSubQuery,
  getUserByAuthSubQuery,
  getUserByIdQuery,
};
