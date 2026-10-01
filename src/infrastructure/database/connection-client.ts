import type postgres from 'postgres';
import type { SqlClient } from './sql-type';

/**
 * Wrap the root postgres.js client.
 *
 * `kind` is `connection`, the handle that can open `begin`. Army queries take
 * `SqlClient`, so this wrapper and the transaction wrapper share one parameter
 * type.
 *
 * @param sql - Root client from `postgres(connectionString)`.
 * @returns The connection variant.
 */
const connectionClient = (sql: postgres.Sql): SqlClient => {
  const client: SqlClient = {
    kind: 'connection',
    sql,
  };
  return client;
};

export { connectionClient };
