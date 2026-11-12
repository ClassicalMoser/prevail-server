import { missingAuth, requireSubject } from './require-auth';

describe('requireSubject function', () => {
  it('returns the subject from auth', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // Auth carries only the subject: the id from the verified token.
    const subject = requireSubject({ subject: 'auth0|user' });

    expect(subject).toBe('auth0|user');
  });
});

describe('missingAuth constant', () => {
  it('is a 401 unauthorized envelope', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // A request with no auth is a 401 'Unauthorized' envelope, the same one
    // every route returns.
    expect(missingAuth).toStrictEqual({
      message: 'Unauthorized',
      status: 401,
      success: false,
    });
  });
});
