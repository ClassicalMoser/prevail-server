import type postgres from 'postgres';

/**
 * One statement a query sent through the template tag.
 *
 * These tests have no database. The recorded text and values are the
 * statement the query function built.
 */
interface RecordedSqlCall {
  text: string;
  values: readonly unknown[];
}

interface RecordedSql {
  calls: RecordedSqlCall[];
  sql: postgres.Sql;
}

/**
 * A template tag that records each statement and returns the given rows.
 *
 * Query suites use this instead of postgres. The tag is only the call
 * signature `Sql` requires; the cast is on the next line for that reason.
 *
 * @param rows - Rows the tag resolves. An empty list means the statement
 * matched nothing.
 * @returns The recorded calls and a client the query can run.
 */
const recordedSql = (rows: readonly postgres.Row[] = []): RecordedSql => {
  const calls: RecordedSqlCall[] = [];
  const tag = (
    strings: TemplateStringsArray,
    ...values: readonly unknown[]
  ): Promise<postgres.Row[]> => {
    const text = strings.join('?').replaceAll(/\s+/gu, ' ').trim();
    const call: RecordedSqlCall = { text, values };
    calls.push(call);
    const produced = rows.map((row) => ({ ...row }));
    return Promise.resolve(produced);
  };
  const sql = tag as postgres.Sql; // template-tag double; Sql also owns the pool
  const recorded: RecordedSql = { calls, sql };
  return recorded;
};

export { recordedSql };
export type { RecordedSql, RecordedSqlCall };
