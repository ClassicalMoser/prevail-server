import { buildCommandCards } from './build-command-cards';
import { tempCommandCards } from '@testing';

describe('buildCommandCards function', () => {
  it(
    'drops a missing card and sorts the rest by the initiatives this test set',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // Two catalog cards re-stamped with initiatives 5 and 1, so their sorted
      // order differs from their row order.
      const later = { ...tempCommandCards[4], initiative: 5 };
      const earlier = { ...tempCommandCards[5], initiative: 1 };
      const cards = buildCommandCards(
        [
          { army_id: 'army-1', command_card_id: later.id, quantity: 1 },
          // A row whose card is no longer in the catalog map is dropped, not an
          // error.
          { army_id: 'army-1', command_card_id: 'missing', quantity: 1 },
          { army_id: 'army-1', command_card_id: earlier.id, quantity: 1 },
        ],
        new Map([
          [later.id, later],
          [earlier.id, earlier],
        ]),
      );

      // The lowest initiative acts first, so the earlier card leads.
      expect(cards.map((card) => card.id)).toStrictEqual([
        earlier.id,
        later.id,
      ]);
    },
  );
});
