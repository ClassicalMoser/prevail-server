import { recordedSql } from '@testing';
import { connectionClient } from '@infrastructure/database/connection-client';
import { deleteArmyCommandCardsQuery } from './delete-army-command-cards-query';

describe('deleteArmyCommandCardsQuery function', () => {
  it(
    'deletes command-card rows for the army this test named',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql();
      const client = connectionClient(recorded.sql);
      await deleteArmyCommandCardsQuery(client, 'army-1');
      const call = recorded.calls[0];

      expect(call?.text).toContain('DELETE FROM army_command_cards');
      expect(call?.values).toStrictEqual(['army-1']);
    },
  );
});
