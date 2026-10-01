import { tempCommandCards } from '@classicalmoser/prevail-rules/domain';
import { buildCommandCards } from './build-command-cards';

describe('buildCommandCards function', () => {
  it(
    'drops a missing card and sorts the rest by the initiatives this test set',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const later = { ...tempCommandCards[4], initiative: 5 };
      const earlier = { ...tempCommandCards[5], initiative: 1 };
      const cards = buildCommandCards(
        [
          { army_id: 'army-1', command_card_id: later.id, quantity: 1 },
          { army_id: 'army-1', command_card_id: 'missing', quantity: 1 },
          { army_id: 'army-1', command_card_id: earlier.id, quantity: 1 },
        ],
        new Map([
          [later.id, later],
          [earlier.id, earlier],
        ]),
      );

      expect(cards.map((card) => card.id)).toStrictEqual([
        earlier.id,
        later.id,
      ]);
    },
  );
});
