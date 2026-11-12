import { requireEnv } from './require-env';

describe('requireEnv function', () => {
  it('answers the value that is set', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(
      requireEnv({ AUTH0_DOMAIN: 'tenant.example.com' }, 'AUTH0_DOMAIN'),
    ).toBe('tenant.example.com');
  });

  it('names the variable that is missing', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(() => requireEnv({}, 'AUTH0_DOMAIN')).toThrow(
      'AUTH0_DOMAIN is not set',
    );
  });

  it('treats an empty value as missing', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(() => requireEnv({ R2_BUCKET: '' }, 'R2_BUCKET')).toThrow(
      'R2_BUCKET is not set',
    );
  });
});
