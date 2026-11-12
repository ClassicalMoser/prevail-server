import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { UnitCardStorage } from '@ports';
import type { UnitCardUseCasesDeps } from './unit-card-use-cases-deps';
import { updateUnitCardCertifications } from './update-unit-card-certifications';
import {
  certificationStatus,
  stubAssetStorage,
  stubUnitCardRenderer,
  tempUnits,
  unitCardStorageDouble,
} from '@testing';

const stubRenderer = stubUnitCardRenderer();
const stubAssets = stubAssetStorage();

const deps = (
  overrides: Partial<UnitCardUseCasesDeps> = {},
): UnitCardUseCasesDeps => ({
  unitCardStorage: unitCardStorageDouble(),
  unitCardRenderer: stubRenderer,
  assetStorage: stubAssets,
  ...overrides,
});

const invalidUnit = {
  ...tempUnits[2],
  stats: undefined as unknown as UnitType['stats'], // unreachable for a real unit; forces schema rejection
};
const validUnitA = tempUnits[0];
const validUnitB = tempUnits[1];

describe('updateUnitCardCertifications function', () => {
  it(
    'certifies valid latest versions and returns the post-write state by entity id',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const certify = vi
        .fn<UnitCardStorage['certifyUnitCardVersions']>()
        .mockResolvedValue({
          success: true,
          data: undefined,
        });
      // Two valid latest versions, both uncertified at first. The second read, after the write, shows both certified.
      const getStatuses = vi
        .fn<UnitCardStorage['getLatestUnitCardCertifications']>()
        .mockResolvedValueOnce({
          success: true,
          data: [
            certificationStatus(validUnitA, false),
            certificationStatus(validUnitB, false),
          ],
        })
        .mockResolvedValueOnce({
          success: true,
          data: [
            certificationStatus(validUnitA, true),
            certificationStatus(validUnitB, true),
          ],
        });

      const useCaseDeps = deps({
        unitCardStorage: unitCardStorageDouble({
          getLatestUnitCardCertifications: getStatuses,
          certifyUnitCardVersions: certify,
        }),
      });

      const result = await updateUnitCardCertifications(useCaseDeps);

      // Every uncertified valid card is written, and the answer is the post-write read (two reads) by card id.
      expect(certify).toHaveBeenCalledWith([validUnitA.id, validUnitB.id]);
      expect(getStatuses).toHaveBeenCalledTimes(2);
      expect(result).toStrictEqual({
        success: true,
        data: { certified: [validUnitA.id, validUnitB.id], uncertified: [] },
      });
    },
  );

  it(
    'skips already-certified versions without certifying them again',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const certify = vi
        .fn<UnitCardStorage['certifyUnitCardVersions']>()
        .mockResolvedValue({
          success: true,
          data: undefined,
        });
      // One card is already certified and the other is not; after the write both are.
      const getStatuses = vi
        .fn<UnitCardStorage['getLatestUnitCardCertifications']>()
        .mockResolvedValueOnce({
          success: true,
          data: [
            certificationStatus(validUnitA, true),
            certificationStatus(validUnitB, false),
          ],
        })
        .mockResolvedValueOnce({
          success: true,
          data: [
            certificationStatus(validUnitA, true),
            certificationStatus(validUnitB, true),
          ],
        });

      const useCaseDeps = deps({
        unitCardStorage: unitCardStorageDouble({
          getLatestUnitCardCertifications: getStatuses,
          certifyUnitCardVersions: certify,
        }),
      });

      const result = await updateUnitCardCertifications(useCaseDeps);

      // Only the uncertified card is written: a certified card is not certified again.
      expect(certify).toHaveBeenCalledWith([validUnitB.id]);
      expect(result).toStrictEqual({
        success: true,
        data: { certified: [validUnitA.id, validUnitB.id], uncertified: [] },
      });
    },
  );

  it(
    'excludes schema-invalid cards from the write and reports them uncertified',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const certify = vi
        .fn<UnitCardStorage['certifyUnitCardVersions']>()
        .mockResolvedValue({
          success: true,
          data: undefined,
        });
      // One valid card and one the rules schema rejects (see the invalid fixture); neither is certified at first, and after the write only the valid one is.
      const getStatuses = vi
        .fn<UnitCardStorage['getLatestUnitCardCertifications']>()
        .mockResolvedValueOnce({
          success: true,
          data: [
            certificationStatus(validUnitA, false),
            certificationStatus(invalidUnit, false),
          ],
        })
        .mockResolvedValueOnce({
          success: true,
          data: [
            certificationStatus(validUnitA, true),
            certificationStatus(invalidUnit, false),
          ],
        });

      const useCaseDeps = deps({
        unitCardStorage: unitCardStorageDouble({
          getLatestUnitCardCertifications: getStatuses,
          certifyUnitCardVersions: certify,
        }),
      });

      const result = await updateUnitCardCertifications(useCaseDeps);

      // Only the valid card is written; the schema-invalid one can never be played, so it is reported uncertified.
      expect(certify).toHaveBeenCalledWith([validUnitA.id]);
      expect(result).toStrictEqual({
        success: true,
        data: { certified: [validUnitA.id], uncertified: [invalidUnit.id] },
      });
    },
  );

  it(
    'propagates a failure from the initial read without writing',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // Certify is never programmed, because it must not run when the first read fails.
      const certify = vi.fn<UnitCardStorage['certifyUnitCardVersions']>();
      const useCaseDeps = deps({
        unitCardStorage: unitCardStorageDouble({
          getLatestUnitCardCertifications: vi
            .fn<UnitCardStorage['getLatestUnitCardCertifications']>()
            .mockResolvedValue({
              success: false,
              message: 'boom',
              status: 500,
            }),
          certifyUnitCardVersions: certify,
        }),
      });

      const result = await updateUnitCardCertifications(useCaseDeps);

      // A failed catalog read stops the run before any write.
      expect(certify).not.toHaveBeenCalled();
      expect(result).toStrictEqual({
        success: false,
        message: 'boom',
        status: 500,
      });
    },
  );

  it(
    'propagates a failure from the write without re-reading',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The first read succeeds; it is the write that follows that fails.
      const getStatuses = vi
        .fn<UnitCardStorage['getLatestUnitCardCertifications']>()
        .mockResolvedValue({
          success: true,
          data: [certificationStatus(validUnitA, false)],
        });
      const useCaseDeps = deps({
        unitCardStorage: unitCardStorageDouble({
          getLatestUnitCardCertifications: getStatuses,
          certifyUnitCardVersions: vi
            .fn<UnitCardStorage['certifyUnitCardVersions']>()
            .mockResolvedValue({
              success: false,
              message: 'no rules',
              status: 500,
            }),
        }),
      });

      const result = await updateUnitCardCertifications(useCaseDeps);

      // The catalog is read once only: after a failed write there is no post-write state to report.
      expect(getStatuses).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        success: false,
        message: 'no rules',
        status: 500,
      });
    },
  );

  it(
    'propagates a failure from the post-write read',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The first read and the write succeed; only the post-write read fails, and that failure is what the caller gets.
      const useCaseDeps = deps({
        unitCardStorage: unitCardStorageDouble({
          getLatestUnitCardCertifications: vi
            .fn<UnitCardStorage['getLatestUnitCardCertifications']>()
            .mockResolvedValueOnce({
              success: true,
              data: [certificationStatus(validUnitA, false)],
            })
            .mockResolvedValueOnce({
              success: false,
              message: 'read failed',
              status: 500,
            }),
          certifyUnitCardVersions: vi
            .fn<UnitCardStorage['certifyUnitCardVersions']>()
            .mockResolvedValue({ success: true, data: undefined }),
        }),
      });

      const result = await updateUnitCardCertifications(useCaseDeps);

      expect(result).toStrictEqual({
        success: false,
        message: 'read failed',
        status: 500,
      });
    },
  );
});
