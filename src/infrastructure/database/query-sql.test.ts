import type postgres from 'postgres';
import { connectionClient } from './connection-client';
import { querySql } from './query-sql';
import { transactionClient } from './transaction-client';

const connectionTag = (
  strings: TemplateStringsArray,
): Promise<postgres.Row[]> => {
  const rows: postgres.Row[] = [{ kind: 'connection', text: strings[0] }];
  return Promise.resolve(rows);
};

const transactionTag = (
  strings: TemplateStringsArray,
): Promise<postgres.Row[]> => {
  const rows: postgres.Row[] = [{ kind: 'transaction', text: strings[0] }];
  return Promise.resolve(rows);
};

describe('querySql function', () => {
  it('runs the connection template', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const sql = connectionTag as postgres.Sql; // template-tag double; Sql also owns the pool
    const query = querySql(connectionClient(sql));
    const rows = await query`select connection`;

    expect(rows).toStrictEqual([
      { kind: 'connection', text: 'select connection' },
    ]);
  });

  it('runs the transaction template', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const sql = transactionTag as postgres.TransactionSql; // template-tag double; TransactionSql also has savepoint
    const query = querySql(transactionClient(sql));
    const rows = await query`select transaction`;

    expect(rows).toStrictEqual([
      { kind: 'transaction', text: 'select transaction' },
    ]);
  });
});
