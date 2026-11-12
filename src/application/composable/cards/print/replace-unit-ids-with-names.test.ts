import { replaceUnitIdsWithNames } from './replace-unit-ids-with-names';

describe('replaceUnitIdsWithNames function', () => {
  it('names each id, keeping the order', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // Two named units; the ids below are given in the opposite order to show the order is kept.
    const names = new Map([
      ['u1', 'Hastati'],
      ['u2', 'Velites'],
    ]);

    expect(replaceUnitIdsWithNames(['u2', 'u1'], names)).toStrictEqual([
      'Velites',
      'Hastati',
    ]);
  });
});
