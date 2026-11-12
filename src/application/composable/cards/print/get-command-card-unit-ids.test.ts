import assert from 'node:assert/strict';
import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import { getCommandCardUnitIds } from './get-command-card-unit-ids';
import { tempCommandCards } from '@testing';

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

      // A command card that restricts and supports by unit type.
      const card = commandCardNamed('Fearless Velites');
      assert.ok(card.unitSupport.supportType === 'unitType');
      const supportedUnitTypeId = card.unitSupport.unitTypeId;

      // The restriction and the support name the same unit, so its id is listed once.
      const ids = getCommandCardUnitIds(card);

      expect(ids).toStrictEqual([supportedUnitTypeId]);
    },
  );

  it(
    'skips a trait filter and keeps the round effect unit-type ids',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // A card restricted by trait (no unit ids) whose round effect is restricted by unit type.
      const card = commandCardNamed('Brace');
      assert.ok(card.command.restrictions.restrictionType === 'trait');
      const roundRestrictions = card.roundEffect.restrictions;
      assert.ok(roundRestrictions.restrictionType === 'unitType');

      // The trait restriction adds no ids; the round effect's unit ids are all that are listed.
      const ids = getCommandCardUnitIds(card);

      expect(ids).toStrictEqual(roundRestrictions.unitRestrictions);
    },
  );
});
