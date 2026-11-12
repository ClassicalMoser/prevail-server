import { recordedSql } from '@testing';
import { connectionClient } from '@infrastructure/database/connection-client';
import { deleteArmyUnitCardsQuery } from './delete-army-unit-cards-query';

describe('deleteArmyUnitCardsQuery function', () => {
  it(
    'deletes unit-card rows for the army this test named',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // No rows are produced; a delete has nothing to return.
      const recorded = recordedSql();
      const client = connectionClient(recorded.sql);
      await deleteArmyUnitCardsQuery(client, 'army-1');
      const call = recorded.calls[0];

      // Replacing an army's composition clears its unit-card rows first.
      expect(call?.text).toContain('DELETE FROM army_unit_cards');
      // Scoped to one army id, so other armies keep their units.
      expect(call?.values).toStrictEqual(['army-1']);
    },
  );
});
