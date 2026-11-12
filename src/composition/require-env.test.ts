import { requireEnv } from './require-env';

describe('requireEnv function', () => {
  it('answers the value that is set', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(
      // A setting that is present comes back unchanged.
      requireEnv({ AUTH0_DOMAIN: 'tenant.example.com' }, 'AUTH0_DOMAIN'),
    ).toBe('tenant.example.com');
  });

  it('names the variable that is missing', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // The error names the variable, so the operator knows what start-up needs.
    expect(() => requireEnv({}, 'AUTH0_DOMAIN')).toThrow(
      'AUTH0_DOMAIN is not set',
    );
  });

  it('treats an empty value as missing', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // An empty string counts as unset, since a blank bucket name is a mistake,
    // not a choice.
    expect(() => requireEnv({ R2_BUCKET: '' }, 'R2_BUCKET')).toThrow(
      'R2_BUCKET is not set',
    );
  });
});
