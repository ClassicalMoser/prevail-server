import type postgres from 'postgres';
import type { SqlClient } from './sql-type';

/**
 * Wrap the handle from `sql.begin`.
 *
 * `kind` is `transaction`. That handle cannot open another `begin`, and it is
 * not assignable to the root `Sql`. The wrapper carries it so the same
 * queries can run inside the transaction.
 *
 * @param sql - Transaction handle from the `begin` callback.
 * @returns The transaction variant.
 */
const transactionClient = (sql: postgres.TransactionSql): SqlClient => {
  const client: SqlClient = {
    kind: 'transaction',
    sql,
  };
  return client;
};

export { transactionClient };
