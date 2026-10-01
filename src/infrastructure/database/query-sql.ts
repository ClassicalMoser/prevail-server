import type postgres from 'postgres';
import type { SqlClient } from './sql-type';

/**
 * Tagged template both client kinds can run.
 *
 * Each variant's `sql` is a different postgres type. After `kind` narrows,
 * that variant assigns to this one signature, and the query text stays in
 * one place.
 */
type QuerySql = <T extends readonly (object | undefined)[] = postgres.Row[]>(
  template: TemplateStringsArray,
  ...parameters: readonly postgres.ParameterOrFragment<never>[]
) => Promise<T>;

/**
 * Read the tagged template for a connection or an open transaction.
 *
 * The branch is the discrimination: a connection yields the root template,
 * a transaction yields the open transaction's template.
 *
 * @param client - Connection or transaction, tagged by `kind`.
 * @returns The tagged template for that handle.
 */
const querySql = (client: SqlClient): QuerySql => {
  switch (client.kind) {
    case 'connection': {
      const sql: QuerySql = client.sql;
      return sql;
    }
    case 'transaction': {
      const sql: QuerySql = client.sql;
      return sql;
    }
    default: {
      const unreachable: never = client;
      return unreachable;
    }
  }
};

export { querySql };
