import { recordedSql } from '@testing';
import { getArmyCommandCardsQuery } from './get-army-command-cards-query';

describe('getArmyCommandCardsQuery function', () => {
  it(
    'reads command-card quantities for the army this test named',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [
        { army_id: 'army-1', command_card_id: 'card-1', quantity: 1 },
      ];
      const recorded = recordedSql(produced);
      const rows = await getArmyCommandCardsQuery(recorded.sql, 'army-1');
      const call = recorded.calls[0];

      expect(call?.text).toContain('FROM army_command_cards');
      expect(call?.values).toStrictEqual(['army-1']);
      expect(rows).toStrictEqual(produced);
    },
  );
});
