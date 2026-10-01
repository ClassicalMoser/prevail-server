import { userMapperToDomain } from './user-to-domain';

describe('userMapperToDomain function', () => {
  it('copies the id and auth subject this test set', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const user = userMapperToDomain({
      user_id: 'user-1',
      user_auth_sub: 'auth0|abc',
    });

    expect(user).toStrictEqual({
      userId: 'user-1',
      authSub: 'auth0|abc',
    });
  });
});
