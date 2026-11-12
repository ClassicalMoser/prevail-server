import { recordedSql } from '@testing';
import { deleteEmptyUnitCards } from './delete-empty-unit-cards';

describe('deleteEmptyUnitCards function', () => {
  it('runs one delete and succeeds', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const recorded = recordedSql([]);

    await expect(deleteEmptyUnitCards(recorded.sql)).resolves.toStrictEqual({
      data: undefined,
      success: true,
    });
    expect(recorded.calls[0]?.text).toContain('DELETE');
  });
});
