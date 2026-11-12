import type postgres from 'postgres';
import { connectionClient } from './connection-client';

const tag = (strings: TemplateStringsArray): Promise<postgres.Row[]> => {
  const rows: postgres.Row[] = [{ text: strings[0] }];
  return Promise.resolve(rows);
};

describe('connectionClient function', () => {
  it('marks the root client as a connection', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // The tag is enough: connectionClient only labels the handle, it never runs
    // a query here.
    const sql = tag as postgres.Sql; // template-tag double; Sql also owns the pool
    const client = connectionClient(sql);

    // The root client is labelled a connection, so a query can tell it from a
    // transaction handle.
    expect(client).toStrictEqual({
      kind: 'connection',
      sql,
    });
  });
});
