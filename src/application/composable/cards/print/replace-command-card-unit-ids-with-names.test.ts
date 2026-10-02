import assert from 'node:assert/strict';
import { tempCommandCards } from '@classicalmoser/prevail-rules/domain';
import { getCommandCardUnitIds } from './get-command-card-unit-ids';
import { replaceCommandCardUnitIdsWithNames } from './replace-command-card-unit-ids-with-names';

const card = tempCommandCards[0];
assert.ok(card !== undefined);

describe('replaceCommandCardUnitIdsWithNames function', () => {
  it(
    'swaps command restriction ids for names from the map',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const unitIds = getCommandCardUnitIds(card);
      const unitIdToNameMap = new Map(
        unitIds.map((id) => [id, `Name-${id.slice(0, 4)}`]),
      );

      const printed = replaceCommandCardUnitIdsWithNames(card, unitIdToNameMap);

      expect(printed.command.restrictions.unitRestrictions).toStrictEqual(
        unitIds.map((id) => unitIdToNameMap.get(id)),
      );
    },
  );
});
