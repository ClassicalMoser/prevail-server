import { recordedSql } from './recorded-sql';

describe('recordedSql function', () => {
  it(
    'records the statement and returns the rows this test supplied',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const supplied = [{ id: 'row-1' }];
      const recorded = recordedSql(supplied);
      const rows = await recorded.sql`select ${'army-1'}`;
      const call = recorded.calls[0];

      expect(call?.text).toBe('select ?');
      expect(call?.values).toStrictEqual(['army-1']);
      expect(rows).toStrictEqual(supplied);
    },
  );
});
