import { getUnitName } from './get-unit-name';

describe('getUnitName function', () => {
  it('answers the name for a known unit id', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(getUnitName(new Map([['u1', 'Hastati']]), 'u1')).toBe('Hastati');
  });

  it('throws naming the id when the map lacks it', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(() => getUnitName(new Map(), 'u2')).toThrow(
      'Unit ID u2 not found in name map',
    );
  });
});
