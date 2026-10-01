import { tempCommandCards } from '@classicalmoser/prevail-rules/domain';
import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import { writeCommandCardVersionMapper } from './write-command-card-version';

describe('writeCommandCardVersionMapper function', () => {
  /** Version columns come from the dotted string. Initiative is stored inside the definition. */
  it(
    'writes the version triple and the initiative from the card this test built',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const source = tempCommandCards[4];
      const card: CommandCard = {
        ...source,
        initiative: 3,
        version: '2.3.4',
      };

      const write = writeCommandCardVersionMapper(card);
      const definition: unknown = JSON.parse(write.command_card_definition);

      expect(write).toMatchObject({
        command_card_id: card.id,
        command_card_name: card.name,
        version_major: 2,
        version_minor: 3,
        version_patch: 4,
      });
      expect(definition).toMatchObject({ initiative: 3 });
    },
  );
});
