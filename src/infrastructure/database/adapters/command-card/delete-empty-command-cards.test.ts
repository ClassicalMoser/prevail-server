import { recordedSql } from '@testing';
import { deleteEmptyCommandCards } from './delete-empty-command-cards';

describe('deleteEmptyCommandCards function', () => {
  it('runs one delete and succeeds', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const recorded = recordedSql([]);

    await expect(deleteEmptyCommandCards(recorded.sql)).resolves.toStrictEqual({
      data: undefined,
      success: true,
    });
    // The cleanup is one DELETE statement.
    expect(recorded.calls[0]?.text).toContain('DELETE');
  });
});
