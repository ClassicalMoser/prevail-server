import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import { tempCommandCards } from '@classicalmoser/prevail-rules/domain';
import type { CommandCardVersionDb } from '../db-types';
import {
  mapCommandCardVersions,
  sortCommandCardsByInitiative,
} from './command-card-mappers';

const withInitiative = (
  card: CommandCard,
  initiative: number,
): CommandCard => ({
  ...card,
  initiative,
});

const toVersion = (
  card: CommandCard,
  initiative: number,
): CommandCardVersionDb => ({
  command_card_id: card.id,
  command_card_version_id: `${card.id}-v`,
  command_card_name: card.name,
  command_card_definition: {
    initiative,
    modifiers: card.modifiers,
    command: card.command,
    roundEffect: card.roundEffect,
    unitSupport: card.unitSupport,
  },
  version_major: 1,
  version_minor: 0,
  version_patch: 0,
});

describe('sortCommandCardsByInitiative function', () => {
  it(
    'sorts by initiative ascending without mutating the input',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const high = withInitiative(tempCommandCards[0], 4);
      const mid = withInitiative(tempCommandCards[1], 2);
      const low = withInitiative(tempCommandCards[2], 1);
      const input = [high, mid, low];

      const sorted = sortCommandCardsByInitiative(input);

      expect(sorted.map((card) => card.initiative)).toStrictEqual([1, 2, 4]);
      expect(input.map((card) => card.initiative)).toStrictEqual([4, 2, 1]);
    },
  );

  it('keeps relative order for equal initiative', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const first = withInitiative(tempCommandCards[0], 2);
    const second = withInitiative(tempCommandCards[1], 2);

    expect(sortCommandCardsByInitiative([second, first])).toStrictEqual([
      second,
      first,
    ]);
  });
});

describe('mapCommandCardVersions function', () => {
  it(
    'maps versions and sorts by initiative ascending',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const mapped = mapCommandCardVersions([
        toVersion(tempCommandCards[0], 3),
        toVersion(tempCommandCards[1], 1),
        toVersion(tempCommandCards[2], 2),
      ]);

      expect(mapped.map((card) => card.initiative)).toStrictEqual([1, 2, 3]);
    },
  );
});
