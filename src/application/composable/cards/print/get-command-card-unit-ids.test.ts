import assert from 'node:assert/strict';
import { tempCommandCards } from '@classicalmoser/prevail-rules/domain';
import { getCommandCardUnitIds } from './get-command-card-unit-ids';

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
