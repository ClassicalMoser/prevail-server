import { recordedSql } from '@testing';
import { getLatestCommandCardCertifications } from './get-latest-command-card-certifications';

describe('getLatestCommandCardCertifications function', () => {
  it(
    'answers an empty catalog as an empty list',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      await expect(
        // With no cards, the certification list is empty, not a failure.
        getLatestCommandCardCertifications(recordedSql([]).sql),
      ).resolves.toStrictEqual({
        data: [],
        success: true,
      });
    },
  );
});
