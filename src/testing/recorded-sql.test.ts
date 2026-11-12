import { recordedSql } from './recorded-sql';

describe('recordedSql function', () => {
  it(
    'records the statement and returns the rows this test supplied',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The rows the statement should answer with.
      const supplied = [{ id: 'row-1' }];
      const recorded = recordedSql(supplied);
      // A one-parameter statement, to see how the tag splits text from values.
      const rows = await recorded.sql`select ${'army-1'}`;
      const call = recorded.calls[0];

      // The parameter becomes a ? placeholder in the recorded text.
      expect(call?.text).toBe('select ?');
      // The parameter's value is recorded separately, as postgres would send
      // it.
      expect(call?.values).toStrictEqual(['army-1']);
      // The tag answers with the supplied rows.
      expect(rows).toStrictEqual(supplied);
    },
  );
});
