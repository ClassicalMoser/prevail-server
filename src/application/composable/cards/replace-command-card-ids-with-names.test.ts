import assert from 'node:assert/strict';
import { tempCommandCards } from '@classicalmoser/prevail-rules/domain';
import {
  getCommandCardUnitIds,
  replaceCommandCardUnitIdsWithNames,
} from './replace-command-card-ids-with-names';

const card = tempCommandCards[0];
assert.ok(card !== undefined);

describe('getCommandCardUnitIds function', () => {
  it(
    'collects unit restriction ids from the sample command card',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const ids = getCommandCardUnitIds(card);

      expect(ids).toStrictEqual([
        ...new Set(card.command.restrictions.unitRestrictions),
      ]);
    },
  );
});

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
