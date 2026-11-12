import type { Restrictions } from '@classicalmoser/prevail-rules/domain';
import { replaceRestrictionUnitIds } from './replace-restriction-unit-ids';

describe('replaceRestrictionUnitIds function', () => {
  it('shows each restricted unit type by name', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const restrictions: Restrictions = {
      inspirationRangeRestriction: 2,
      restrictionType: 'unitType',
      unitRestrictions: ['u1'],
    };

    expect(
      replaceRestrictionUnitIds(restrictions, new Map([['u1', 'Hastati']])),
    ).toStrictEqual({
      inspirationRangeRestriction: 2,
      restrictionType: 'unitType',
      unitRestrictions: ['Hastati'],
    });
  });

  it('leaves an open restriction as it is', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const restrictions = {
      inspirationRangeRestriction: 1,
      restrictionType: 'none',
    } as const;

    expect(replaceRestrictionUnitIds(restrictions, new Map())).toStrictEqual(
      restrictions,
    );
  });
});
