import { tempCommandCards } from '@classicalmoser/prevail-rules/domain';
import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { CommandCardVersionDb } from '../db-types';
import { mapCommandCardVersions } from './map-command-card-versions';

const toVersion = (
  card: CommandCard,
  initiative: number,
): CommandCardVersionDb => {
  const row: CommandCardVersionDb = {
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
  };
  return row;
};

describe('mapCommandCardVersions function', () => {
  /** Initiative lives in the JSON definition. The mapper sorts on that value, not row order. */
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
      expect(mapped.map((card) => card.id)).toStrictEqual([
        tempCommandCards[1].id,
        tempCommandCards[2].id,
        tempCommandCards[0].id,
      ]);
      expect(mapped[0]?.version).toBe('1.0.0');
    },
  );
});
