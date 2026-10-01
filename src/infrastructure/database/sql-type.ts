import type postgres from 'postgres';

/**
 * Root postgres.js client.
 *
 * Adapters hold this. Multi-step writes call `begin` on it so the statements
 * share one transaction.
 */
type Sql = postgres.Sql;

/**
 * A postgres handle plus which kind of handle it is.
 *
 * `connection` is the root client and can open `begin`. `transaction` is the
 * handle that callback receives. It is not a `Sql`. Callers match on `kind`
 * and then use that variant's tagged template. The two handles stay distinct,
 * so nothing casts a transaction into a connection.
 */
type SqlClient =
  | {
      kind: 'connection';
      sql: postgres.Sql;
    }
  | {
      kind: 'transaction';
      sql: postgres.TransactionSql;
    };

export type { Sql, SqlClient };
