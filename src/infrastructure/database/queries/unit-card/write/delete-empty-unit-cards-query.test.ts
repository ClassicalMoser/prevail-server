import { recordedSql } from '@testing';
import { deleteEmptyUnitCardsQuery } from './delete-empty-unit-cards-query';

describe('deleteEmptyUnitCardsQuery function', () => {
  it(
    'deletes unit cards that have no version row',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql();
      await deleteEmptyUnitCardsQuery(recorded.sql);
      const call = recorded.calls[0];

      expect(call?.text).toContain('DELETE FROM unit_cards');
      expect(call?.values).toStrictEqual([]);
    },
  );
});
