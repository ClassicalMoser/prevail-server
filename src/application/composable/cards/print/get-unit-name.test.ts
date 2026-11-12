import { getUnitName } from './get-unit-name';

describe('getUnitName function', () => {
  it('answers the name for a known unit id', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // A printed card shows the stored name for a unit it knows.
    expect(getUnitName(new Map([['u1', 'Hastati']]), 'u1')).toBe('Hastati');
  });

  it('throws naming the id when the map lacks it', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // An id missing from the map means the name list was built wrongly, so it fails loudly instead of printing a blank.
    expect(() => getUnitName(new Map(), 'u2')).toThrow(
      'Unit ID u2 not found in name map',
    );
  });
});
