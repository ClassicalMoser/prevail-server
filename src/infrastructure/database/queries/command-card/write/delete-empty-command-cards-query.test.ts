import { recordedSql } from '@testing';
import { deleteEmptyCommandCardsQuery } from './delete-empty-command-cards-query';

describe('deleteEmptyCommandCardsQuery function', () => {
  it(
    'deletes command cards that have no version row',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql();
      await deleteEmptyCommandCardsQuery(recorded.sql);
      const call = recorded.calls[0];

      expect(call?.text).toContain('DELETE FROM command_cards');
      expect(call?.values).toStrictEqual([]);
    },
  );
});
