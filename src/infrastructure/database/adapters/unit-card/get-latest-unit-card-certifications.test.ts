import { recordedSql } from '@testing';
import { getLatestUnitCardCertifications } from './get-latest-unit-card-certifications';

describe('getLatestUnitCardCertifications function', () => {
  it(
    'answers an empty catalog as an empty list',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      await expect(
        // With no cards, the certification list is empty, not a failure.
        getLatestUnitCardCertifications(recordedSql([]).sql),
      ).resolves.toStrictEqual({
        data: [],
        success: true,
      });
    },
  );
});
