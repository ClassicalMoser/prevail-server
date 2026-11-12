import type postgres from 'postgres';

/**
 * Answer rows only to the statement whose text contains `fragment`.
 *
 * For code that runs several queries, a test scripts the one it cares about
 * and leaves every other statement matching nothing. Pass the result to
 * {@link recordedSql}.
 *
 * @param fragment - Part of the statement text that picks the statement.
 * @param rows - Rows that statement answers.
 * @returns A per-statement answer for `recordedSql`.
 */
const rowsForStatement =
  (fragment: string, rows: readonly postgres.Row[]) =>
  (text: string): readonly postgres.Row[] => {
    const matched = text.includes(fragment) ? rows : [];
    return matched;
  };

export { rowsForStatement };
