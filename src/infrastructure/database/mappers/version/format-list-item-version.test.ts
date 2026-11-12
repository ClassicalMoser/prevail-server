import { formatListItemVersion } from './format-list-item-version';

describe('formatListItemVersion function', () => {
  it('returns null when the major column is null', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // A card with no major column has no version to show.
    const version = formatListItemVersion(null, null, null);

    expect(version).toBeNull();
  });

  it(
    'fills missing minor and patch with zero when major is present',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // Only a major is set, as from a left join that found a partial row.
      const version = formatListItemVersion(1, null, null);

      // Missing minor and patch read as 0.
      expect(version).toBe('1.0.0');
    },
  );
});
