import assert from 'node:assert/strict';
import { tempCommandCards } from '@classicalmoser/prevail-rules/domain';
import type { CommandCardVersionDb } from '@infrastructure/database/db-types';
import { commandCardVersionMapperToDomain } from './command-card-version-to-domain';

const card = tempCommandCards[0];
assert.ok(card !== undefined);

const versionRow = (): CommandCardVersionDb => ({
  command_card_definition: {
    command: card.command,
    initiative: card.initiative,
    modifiers: card.modifiers,
    roundEffect: card.roundEffect,
    unitSupport: card.unitSupport,
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

      const mapped = commandCardVersionMapperToDomain(versionRow());

      expect(mapped).toMatchObject({
        id: card.id,
        name: card.name,
        version: '2.3.4',
      });
      expect(mapped.initiative).toBe(card.initiative);
    },
  );
});
