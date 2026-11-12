import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import { writeCommandCardVersionMapper } from './write-command-card-version';
import { tempCommandCards } from '@testing';

describe('writeCommandCardVersionMapper function', () => {
  /** Version columns come from the dotted string. Initiative is stored inside the definition. */
  it(
    'writes the version triple and the initiative from the card this test built',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const source = tempCommandCards[4];
      // A catalog card with cost 7, initiative 3 and version '2.3.4' chosen by
      // the test.
      const card: CommandCard = {
        ...source,
        cost: 7,
        initiative: 3,
        version: '2.3.4',
      };

      const write = writeCommandCardVersionMapper(card);
      // The definition column is stored as JSON text; parsed back to read cost
      // and initiative.
      const definition: unknown = JSON.parse(write.command_card_definition);

      // The dotted version is split into three columns.
      expect(write).toMatchObject({
        command_card_id: card.id,
        command_card_name: card.name,
        version_major: 2,
        version_minor: 3,
        version_patch: 4,
      });
      // Cost and initiative live inside the JSON definition, not in their own
      // columns.
      expect(definition).toMatchObject({ cost: 7, initiative: 3 });
    },
  );
});
