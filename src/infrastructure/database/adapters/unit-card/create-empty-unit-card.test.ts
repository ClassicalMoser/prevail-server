import { recordedSql } from '@testing';
import { createEmptyUnitCard } from './create-empty-unit-card';

describe('createEmptyUnitCard function', () => {
  it('answers the id of the new unit card', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    // The insert returns the new card's id, as the database would assign it.
    const recorded = recordedSql([
      { unit_card_id: '550e8400-e29b-41d4-a716-446655440099' },
    ]);

    await expect(createEmptyUnitCard(recorded.sql)).resolves.toStrictEqual({
      data: '550e8400-e29b-41d4-a716-446655440099',
      success: true,
    });
  });
});
