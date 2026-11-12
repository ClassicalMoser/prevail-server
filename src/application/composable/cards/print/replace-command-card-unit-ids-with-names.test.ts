import assert from 'node:assert/strict';
import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { UnitIdToNameMap } from './unit-id-to-name-map';
import { getCommandCardUnitIds } from './get-command-card-unit-ids';
import { replaceCommandCardUnitIdsWithNames } from './replace-command-card-unit-ids-with-names';
import { tempCommandCards } from '@testing';

const commandCardNamed = (name: string): CommandCard => {
  const card = tempCommandCards.find((candidate) => candidate.name === name);
  assert.ok(card !== undefined);
  return card;
};

const namesFor = (card: CommandCard): UnitIdToNameMap => {
  const unitIds = getCommandCardUnitIds(card);
  const unitIdToNameMap = new Map(
    unitIds.map((id) => [id, `Name-${id.slice(0, 4)}`]),
  );
  return unitIdToNameMap;
};

describe('replaceCommandCardUnitIdsWithNames function', () => {
  it(
    'swaps unit-type restriction ids and the supported unit type for names',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // A card that restricts and supports by unit type, so both places hold unit ids.
      const card = commandCardNamed('Fearless Velites');
      assert.ok(card.command.restrictions.restrictionType === 'unitType');
      assert.ok(card.unitSupport.supportType === 'unitType');
      // Placeholder names stand in for storage; only that an id becomes its name matters here.
      const unitIdToNameMap = namesFor(card);
      const expectedName = unitIdToNameMap.get(card.unitSupport.unitTypeId);

      const printed = replaceCommandCardUnitIdsWithNames(card, unitIdToNameMap);
      const printedRestrictions = printed.command.restrictions;
      assert.ok(printedRestrictions.restrictionType === 'unitType');
      assert.ok(printed.unitSupport.supportType === 'unitType');

      expect(printedRestrictions.unitRestrictions).toStrictEqual([
        expectedName,
      ]);
      expect(printed.unitSupport.unitTypeId).toBe(expectedName);
    },
  );

  it('leaves a trait restriction unchanged', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // A trait-restricted card has no unit ids in its restriction, so printing must leave it as it is.
    const card = commandCardNamed('Brace');
    const printed = replaceCommandCardUnitIdsWithNames(card, namesFor(card));

    expect(printed.command.restrictions).toStrictEqual(
      card.command.restrictions,
    );
  });
});
