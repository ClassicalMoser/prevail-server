import { recordedSql, rowsForStatement } from '@testing';
import { hydrateArmy } from './hydrate-army';

// The army row only: id, name and owner. Hydration adds its units and command
// cards.
const row = {
  army_id: 'army-1',
  army_name: 'Legion',
  user_id: 'user-1',
  public: false,
  archived_at: null,
};

// A join row saying the army holds two of a unit card that the catalog no
// longer has.
const savedUnit = [
  { army_id: 'army-1', quantity: 2, unit_card_id: 'unit-gone' },
];

describe('hydrateArmy function', () => {
  it(
    'names the army from its row and leaves it empty when nothing is saved',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // No rows are scripted, so the army has no saved units or command cards.
      const recorded = recordedSql();
      // The army row alone is hydrated; nothing saved means no units or cards.
      const army = await hydrateArmy(recorded.sql, row);

      // The army keeps its id and name from the row and carries empty lists.
      expect(army).toStrictEqual({
        commandCards: [],
        id: 'army-1',
        name: 'Legion',
        units: [],
      });
    },
  );

  it(
    'drops a saved unit whose card is no longer in the catalog',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The join table still lists the unit; the catalog query finds nothing.
      const recorded = recordedSql(
        rowsForStatement('FROM army_unit_cards', savedUnit),
      );
      // Hydrating the army whose saved unit is gone from the catalog.
      const army = await hydrateArmy(recorded.sql, row);

      // A retired unit card is skipped quietly rather than failing the whole
      // army.
      expect(army.units).toStrictEqual([]);
    },
  );

  it(
    'skips the command-card catalog query when the army has none',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql(
        rowsForStatement('FROM army_unit_cards', savedUnit),
      );
      // Only a unit join row exists, so no command-card ids are known.
      await hydrateArmy(recorded.sql, row);

      // Two join-row reads and one unit-catalog read. No command-card catalog read.
      // The three reads counted here show the command-card catalog lookup was
      // not made for an empty id list.
      expect(recorded.calls).toHaveLength(3);
    },
  );
});
