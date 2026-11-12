import type { Restrictions } from '@classicalmoser/prevail-rules/domain';
import { replaceRestrictionUnitIds } from './replace-restriction-unit-ids';

describe('replaceRestrictionUnitIds function', () => {
  it('shows each restricted unit type by name', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // A restriction naming one unit type by id, with a range value that must survive the swap.
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

    // A restriction with no unit ids to name.
    const restrictions = {
      inspirationRangeRestriction: 1,
      restrictionType: 'none',
    } as const;

    expect(replaceRestrictionUnitIds(restrictions, new Map())).toStrictEqual(
      restrictions,
    );
  });
});
