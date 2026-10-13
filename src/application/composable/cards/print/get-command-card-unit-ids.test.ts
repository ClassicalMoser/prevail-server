import assert from 'node:assert/strict';
import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import { tempCommandCards } from '@classicalmoser/prevail-rules/domain';
import { getCommandCardUnitIds } from './get-command-card-unit-ids';

const commandCardNamed = (name: string): CommandCard => {
  const card = tempCommandCards.find((candidate) => candidate.name === name);
  assert.ok(card !== undefined);
  return card;
};

describe('getCommandCardUnitIds function', () => {
  it(
    'collects unit-type restriction ids and the supported unit type once each',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const card = commandCardNamed('Fearless Velites');
      assert.ok(card.unitSupport.supportType === 'unitType');
      const supportedUnitTypeId = card.unitSupport.unitTypeId;

      const ids = getCommandCardUnitIds(card);

      expect(ids).toStrictEqual([supportedUnitTypeId]);
    },
  );

  it(
    'skips a trait filter and keeps the round effect unit-type ids',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const card = commandCardNamed('Brace');
      assert.ok(card.command.restrictions.restrictionType === 'trait');
      const roundRestrictions = card.roundEffect.restrictions;
      assert.ok(roundRestrictions.restrictionType === 'unitType');

      const ids = getCommandCardUnitIds(card);

      expect(ids).toStrictEqual(roundRestrictions.unitRestrictions);
    },
  );
});
