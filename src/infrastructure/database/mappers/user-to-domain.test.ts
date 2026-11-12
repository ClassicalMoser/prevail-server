import { userMapperToDomain } from './user-to-domain';

describe('userMapperToDomain function', () => {
  it('copies the id and auth subject this test set', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // A user row with snake_case columns.
    const user = userMapperToDomain({
      user_id: 'user-1',
      user_auth_sub: 'auth0|abc',
    });

    // The domain user uses camelCase names for the same two values.
    expect(user).toStrictEqual({
      userId: 'user-1',
      authSub: 'auth0|abc',
    });
  });
});
