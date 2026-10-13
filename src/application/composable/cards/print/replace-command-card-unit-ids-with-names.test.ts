import assert from 'node:assert/strict';
import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import { tempCommandCards } from '@classicalmoser/prevail-rules/domain';
import type { UnitIdToNameMap } from './unit-id-to-name-map';
import { getCommandCardUnitIds } from './get-command-card-unit-ids';
import { replaceCommandCardUnitIdsWithNames } from './replace-command-card-unit-ids-with-names';

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

      const card = commandCardNamed('Fearless Velites');
      assert.ok(card.command.restrictions.restrictionType === 'unitType');
      assert.ok(card.unitSupport.supportType === 'unitType');
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

    const card = commandCardNamed('Brace');
    const printed = replaceCommandCardUnitIdsWithNames(card, namesFor(card));

    expect(printed.command.restrictions).toStrictEqual(
      card.command.restrictions,
    );
  });
});
