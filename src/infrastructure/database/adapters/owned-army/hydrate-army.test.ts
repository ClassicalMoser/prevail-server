import { recordedSql, rowsForStatement } from '@testing';
import { hydrateArmy } from './hydrate-army';

const row = {
  army_id: 'army-1',
  army_name: 'Legion',
  user_id: 'user-1',
  public: false,
  archived_at: null,
};

const savedUnit = [
  { army_id: 'army-1', quantity: 2, unit_card_id: 'unit-gone' },
];

describe('hydrateArmy function', () => {
  it(
    'names the army from its row and leaves it empty when nothing is saved',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql();
      const army = await hydrateArmy(recorded.sql, row);

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
      const army = await hydrateArmy(recorded.sql, row);

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
      await hydrateArmy(recorded.sql, row);

      // Two join-row reads and one unit-catalog read. No command-card catalog read.
      expect(recorded.calls).toHaveLength(3);
    },
  );
});
