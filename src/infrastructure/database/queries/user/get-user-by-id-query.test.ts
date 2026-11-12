import { recordedSql } from '@testing';
import { getUserByIdQuery } from './get-user-by-id-query';

describe('getUserByIdQuery function', () => {
  it('reads the user row for this id', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const produced = [{ user_id: 'user-1', user_auth_sub: 'auth0|owner' }];
    // A recorded tag stands in for postgres: the test pins the statement text
    // and bound values, not database behaviour.
    const recorded = recordedSql(produced);
    const rows = await getUserByIdQuery(recorded.sql, 'user-1');
    const call = recorded.calls[0];

    // The row is selected by the internal user id, bound as a parameter.
    expect(call?.text).toContain('WHERE user_id');
    expect(call?.values).toStrictEqual(['user-1']);
    expect(rows).toStrictEqual(produced);
  });
});
