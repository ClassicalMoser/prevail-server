import { tempCommandCards } from '@classicalmoser/prevail-rules/domain';
import { toArmyCommandCardRows } from './to-army-command-card-rows';

describe('toArmyCommandCardRows function', () => {
  it(
    'writes one row of quantity 1 for the card this test passed',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const card = tempCommandCards[4];
      const rows = toArmyCommandCardRows('army-1', [card]);

      expect(rows).toStrictEqual([
        {
          army_id: 'army-1',
          command_card_id: card.id,
          quantity: 1,
        },
      ]);
    },
  );
});
