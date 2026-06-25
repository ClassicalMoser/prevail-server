import { tempUnits } from '@classicalmoser/prevail-rules/domain';
import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type {
  UnitCardCertificationStatus,
  UnitCardRendererPort,
  UnitCardStorage,
} from '@ports';
import { createUnitCardUseCases } from './unit-card-use-cases';

const validUnitA = tempUnits[0];
const validUnitB = tempUnits[1];

// Drop a required nested field so the domain schema rejects it.
const invalidUnit = {
  ...tempUnits[2],
  stats: undefined as unknown as UnitType['stats'],
};

const status = (
  card: UnitType,
  certified: boolean,
): UnitCardCertificationStatus => ({ card, certified });

const buildStorage = (
  overrides: Partial<UnitCardStorage> = {},
): UnitCardStorage => ({
  getCurrentUnitCards: vi.fn<UnitCardStorage['getCurrentUnitCards']>(),
  getAllUnitCards: vi.fn<UnitCardStorage['getAllUnitCards']>(),
  getUnitCardById: vi.fn<UnitCardStorage['getUnitCardById']>(),
  getUnitCardsByIds: vi.fn<UnitCardStorage['getUnitCardsByIds']>(),
  createEmptyUnitCard: vi.fn<UnitCardStorage['createEmptyUnitCard']>(),
  createUnitCardVersion: vi.fn<UnitCardStorage['createUnitCardVersion']>(),
  deleteEmptyUnitCards: vi.fn<UnitCardStorage['deleteEmptyUnitCards']>(),
  getLatestUnitCardCertifications:
    vi.fn<UnitCardStorage['getLatestUnitCardCertifications']>(),
  certifyUnitCardVersions: vi.fn<UnitCardStorage['certifyUnitCardVersions']>(),
  ...overrides,
});

const stubRenderer: UnitCardRendererPort = {
  renderUnitCard: vi.fn<UnitCardRendererPort['renderUnitCard']>(),
};

describe('updateUnitCardCertifications', () => {
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
      const getStatuses = vi
        .fn<UnitCardStorage['getLatestUnitCardCertifications']>()
        .mockResolvedValueOnce({
          success: true,
          data: [status(validUnitA, false), status(validUnitB, false)],
        })
        .mockResolvedValueOnce({
          success: true,
          data: [status(validUnitA, true), status(validUnitB, true)],
        });

      const useCases = createUnitCardUseCases(
        buildStorage({
          getLatestUnitCardCertifications: getStatuses,
          certifyUnitCardVersions: certify,
        }),
        stubRenderer,
      );

      const result = await useCases.updateUnitCardCertifications();

      expect(certify).toHaveBeenCalledWith([validUnitA.id, validUnitB.id]);
      expect(getStatuses).toHaveBeenCalledTimes(2);
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
      const getStatuses = vi
        .fn<UnitCardStorage['getLatestUnitCardCertifications']>()
        .mockResolvedValueOnce({
          success: true,
          data: [status(validUnitA, false), status(invalidUnit, false)],
        })
        .mockResolvedValueOnce({
          success: true,
          data: [status(validUnitA, true), status(invalidUnit, false)],
        });

      const useCases = createUnitCardUseCases(
        buildStorage({
          getLatestUnitCardCertifications: getStatuses,
          certifyUnitCardVersions: certify,
        }),
        stubRenderer,
      );

      const result = await useCases.updateUnitCardCertifications();

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

      const certify = vi.fn<UnitCardStorage['certifyUnitCardVersions']>();
      const useCases = createUnitCardUseCases(
        buildStorage({
          getLatestUnitCardCertifications: vi
            .fn<UnitCardStorage['getLatestUnitCardCertifications']>()
            .mockResolvedValue({
              success: false,
              message: 'boom',
              status: 500,
            }),
          certifyUnitCardVersions: certify,
        }),
        stubRenderer,
      );

      const result = await useCases.updateUnitCardCertifications();

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

      const getStatuses = vi
        .fn<UnitCardStorage['getLatestUnitCardCertifications']>()
        .mockResolvedValue({
          success: true,
          data: [status(validUnitA, false)],
        });
      const useCases = createUnitCardUseCases(
        buildStorage({
          getLatestUnitCardCertifications: getStatuses,
          certifyUnitCardVersions: vi
            .fn<UnitCardStorage['certifyUnitCardVersions']>()
            .mockResolvedValue({
              success: false,
              message: 'no rules',
              status: 500,
            }),
        }),
        stubRenderer,
      );

      const result = await useCases.updateUnitCardCertifications();

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

      const useCases = createUnitCardUseCases(
        buildStorage({
          getLatestUnitCardCertifications: vi
            .fn<UnitCardStorage['getLatestUnitCardCertifications']>()
            .mockResolvedValueOnce({
              success: true,
              data: [status(validUnitA, false)],
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
        stubRenderer,
      );

      const result = await useCases.updateUnitCardCertifications();

      expect(result).toStrictEqual({
        success: false,
        message: 'read failed',
        status: 500,
      });
    },
  );
});
