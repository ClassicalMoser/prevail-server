import type postgres from 'postgres';
import { recordedSql } from './recorded-sql';
import type { RecordedSql } from './recorded-sql';

/**
 * Like {@link recordedSql}, with a `begin` that runs its callback on the same
 * recording tag, so a transaction's statements are recorded too.
 *
 * It never rolls back: a test that needs rollback writes its own double.
 *
 * @param rows - Rows the tag resolves for every statement.
 * @returns The recorded calls and a client whose `begin` works.
 */
const recordedTransactionSql = (
  rows: readonly postgres.Row[] = [],
): RecordedSql => {
  const recorded = recordedSql(rows);
  const begin = async (
    run: (tx: postgres.Sql) => Promise<unknown>,
  ): Promise<unknown> => {
    const outcome = await run(recorded.sql);
    return outcome;
  };
  const sql = { begin } as unknown as postgres.Sql; // begin-only double; Sql also owns the pool
  const transactional: RecordedSql = { calls: recorded.calls, sql };
  return transactional;
};

export { recordedTransactionSql };
