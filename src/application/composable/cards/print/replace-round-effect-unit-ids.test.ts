import type { RoundEffect } from '@classicalmoser/prevail-rules/domain';
import { replaceRoundEffectUnitIds } from './replace-round-effect-unit-ids';

describe('replaceRoundEffectUnitIds function', () => {
  it(
    "shows the round effect's restricted units by name and keeps its modifiers",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // A round effect restricted to one unit type by id, with a modifier that printing must not touch.
      const roundEffect: RoundEffect = {
        modifiers: [{ type: 'attack', value: 1 }],
        restrictions: {
          inspirationRangeRestriction: 1,
          restrictionType: 'unitType',
          unitRestrictions: ['u1'],
        },
      } as const;

      expect(
        replaceRoundEffectUnitIds(roundEffect, new Map([['u1', 'Hastati']])),
      ).toStrictEqual({
        modifiers: [{ type: 'attack', value: 1 }],
        restrictions: {
          inspirationRangeRestriction: 1,
          restrictionType: 'unitType',
          unitRestrictions: ['Hastati'],
        },
      });
    },
  );
});
