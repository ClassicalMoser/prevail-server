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
 * matched nothing. A function answers per statement, from its text, for code
 * that runs several different queries.
 * @returns The recorded calls and a client the query can run.
 */
const recordedSql = (
  rows:
    | readonly postgres.Row[]
    | ((text: string) => readonly postgres.Row[]) = [],
): RecordedSql => {
  const calls: RecordedSqlCall[] = [];
  const tag = (
    strings: TemplateStringsArray,
    ...values: readonly unknown[]
  ): Promise<postgres.Row[]> => {
    // Whitespace is collapsed so a test can match statement text without caring
    // how the SQL is indented.
    const text = strings.join('?').replaceAll(/\s+/gu, ' ').trim();
    const call: RecordedSqlCall = { text, values };
    calls.push(call);
    const answered = typeof rows === 'function' ? rows(text) : rows;
    // Rows are copied so a query that mutates its result cannot change the
    // test's fixture.
    const produced = answered.map((row) => ({ ...row }));
    const resolved = Promise.resolve(produced);
    return resolved;
  };
  const sql = tag as postgres.Sql; // template-tag double; Sql also owns the pool
  const recorded: RecordedSql = { calls, sql };
  return recorded;
};

export { recordedSql };
export type { RecordedSql, RecordedSqlCall };
