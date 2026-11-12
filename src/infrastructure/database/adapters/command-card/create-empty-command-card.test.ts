import { recordedSql } from '@testing';
import { createEmptyCommandCard } from './create-empty-command-card';

describe('createEmptyCommandCard function', () => {
  it('answers the id of the new command card', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const recorded = recordedSql([
      { command_card_id: '550e8400-e29b-41d4-a716-446655440099' },
    ]);

    await expect(createEmptyCommandCard(recorded.sql)).resolves.toStrictEqual({
      data: '550e8400-e29b-41d4-a716-446655440099',
      success: true,
    });
  });
});
