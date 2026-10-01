import type postgres from 'postgres';
import { transactionClient } from './transaction-client';

const tag = (strings: TemplateStringsArray): Promise<postgres.Row[]> => {
  const rows: postgres.Row[] = [{ text: strings[0] }];
  return Promise.resolve(rows);
};

describe('transactionClient function', () => {
  it('marks the begin handle as a transaction', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const sql = tag as postgres.TransactionSql; // template-tag double; TransactionSql also has savepoint
    const client = transactionClient(sql);

    expect(client).toStrictEqual({
      kind: 'transaction',
      sql,
    });
  });
});
