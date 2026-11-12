import assert from 'node:assert/strict';
import type { CommandCardVersionDb } from '@infrastructure/database/db-types';
import { commandCardVersionMapperToDomain } from './command-card-version-to-domain';
import { tempCommandCards } from '@testing';

// A catalog card; its fields fill a database row's definition column.
const card = tempCommandCards[0];
assert.ok(card !== undefined);

const versionRow = (): CommandCardVersionDb => ({
  command_card_definition: {
    command: card.command,
    initiative: card.initiative,
    modifiers: card.modifiers,
    roundEffect: card.roundEffect,
    unitSupport: card.unitSupport,
    cost: 15,
  },
  command_card_id: card.id,
  command_card_name: card.name,
  command_card_version_id: `${card.id}-v`,
  version_major: 2,
  version_minor: 3,
  version_patch: 4,
});

describe('commandCardVersionMapperToDomain function', () => {
  it(
    'rebuilds the card with the version triple from the row columns',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // Version 2.3.4 and cost 15 are set on the row, differing from the card's
      // own, so the test shows which source wins.
      const mapped = commandCardVersionMapperToDomain(versionRow());

      // The version string comes from the version columns; cost comes from the
      // definition JSON.
      expect(mapped).toMatchObject({
        id: card.id,
        name: card.name,
        version: '2.3.4',
        cost: 15,
      });
      expect(mapped.initiative).toBe(card.initiative);
    },
  );
});
