import { formatListItemVersion } from './format-list-item-version';

describe('formatListItemVersion function', () => {
  it('returns null when the major column is null', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const version = formatListItemVersion(null, null, null);

    expect(version).toBeNull();
  });

  it(
    'fills missing minor and patch with zero when major is present',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const version = formatListItemVersion(1, null, null);

      expect(version).toBe('1.0.0');
    },
  );
});
