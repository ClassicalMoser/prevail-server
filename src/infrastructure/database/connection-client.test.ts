import type postgres from 'postgres';
import { connectionClient } from './connection-client';

const tag = (strings: TemplateStringsArray): Promise<postgres.Row[]> => {
  const rows: postgres.Row[] = [{ text: strings[0] }];
  return Promise.resolve(rows);
};

describe('connectionClient function', () => {
  it('marks the root client as a connection', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const sql = tag as postgres.Sql; // template-tag double; Sql also owns the pool
    const client = connectionClient(sql);

    expect(client).toStrictEqual({
      kind: 'connection',
      sql,
    });
  });
});
