import { recordedSql } from '@testing';
import { connectionClient } from '@infrastructure/database/connection-client';
import { insertArmyCommandCardQuery } from './insert-army-command-card-query';

describe('insertArmyCommandCardQuery function', () => {
  it('inserts one command card at quantity 1', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const recorded = recordedSql();
    const client = connectionClient(recorded.sql);
    // One command card at quantity 1: a command card is held once in an army.
    const row = { army_id: 'army-1', command_card_id: 'card-1', quantity: 1 };
    await insertArmyCommandCardQuery(client, row);
    const call = recorded.calls[0];

    // Each command card is one join row, written after the composition is
    // cleared.
    expect(call?.text).toContain('INSERT INTO army_command_cards');
    // Army id, card id, quantity, in column order.
    expect(call?.values).toStrictEqual(['army-1', 'card-1', 1]);
  });
});
