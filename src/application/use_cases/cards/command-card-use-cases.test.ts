import {
  tempCommandCards,
  tempUnits,
} from '@classicalmoser/prevail-rules/domain';
import type { Card } from '@classicalmoser/prevail-rules/domain';
import type {
  AssetStorage,
  CommandCardCertificationStatus,
  CommandCardRendererPort,
  CommandCardStorage,
  CommandCardUseCasesPort,
  UnitCardStorage,
} from '@ports';
import { createCommandCardUseCases } from './command-card-use-cases';
import { getCommandCardUnitIds } from '@application/composable';

// Indices 4/5 have unitSupport.count >= 1, satisfying the domain schema.
const validCardA = tempCommandCards[4];
const validCardB = tempCommandCards[5];

// Drop a required nested field so the domain schema rejects it.
const invalidCard = {
  ...tempCommandCards[2],
  command: undefined as unknown as Card['command'],
};

const status = (
  card: Card,
  certified: boolean,
): CommandCardCertificationStatus => ({ card, certified });

const buildStorage = (
  overrides: Partial<CommandCardStorage> = {},
): CommandCardStorage => ({
  getCurrentCommandCards: vi.fn<CommandCardStorage['getCurrentCommandCards']>(),
  getAllCommandCards: vi.fn<CommandCardStorage['getAllCommandCards']>(),
  getCommandCardById: vi.fn<CommandCardStorage['getCommandCardById']>(),
  getCommandCardsByIds: vi.fn<CommandCardStorage['getCommandCardsByIds']>(),
  createEmptyCommandCard: vi.fn<CommandCardStorage['createEmptyCommandCard']>(),
  createCommandCardVersion:
    vi.fn<CommandCardStorage['createCommandCardVersion']>(),
  deleteCommandCardVersion:
    vi.fn<CommandCardStorage['deleteCommandCardVersion']>(),
  deleteEmptyCommandCards:
    vi.fn<CommandCardStorage['deleteEmptyCommandCards']>(),
  getLatestCommandCardCertifications:
    vi.fn<CommandCardStorage['getLatestCommandCardCertifications']>(),
  certifyCommandCardVersions:
    vi.fn<CommandCardStorage['certifyCommandCardVersions']>(),
  ...overrides,
});

const buildUnitStorage = (
  overrides: Partial<UnitCardStorage> = {},
): UnitCardStorage => ({
  getCurrentUnitCards: vi.fn<UnitCardStorage['getCurrentUnitCards']>(),
  getAllUnitCards: vi.fn<UnitCardStorage['getAllUnitCards']>(),
  getUnitCardById: vi.fn<UnitCardStorage['getUnitCardById']>(),
  getUnitCardsByIds: vi
    .fn<UnitCardStorage['getUnitCardsByIds']>()
    .mockImplementation(async (ids) => ({
      success: true,
      data: ids.map((id) => ({ ...tempUnits[0], id, name: `Unit-${id}` })),
    })),
  createEmptyUnitCard: vi.fn<UnitCardStorage['createEmptyUnitCard']>(),
  createUnitCardVersion: vi.fn<UnitCardStorage['createUnitCardVersion']>(),
  deleteUnitCardVersion: vi.fn<UnitCardStorage['deleteUnitCardVersion']>(),
  deleteEmptyUnitCards: vi.fn<UnitCardStorage['deleteEmptyUnitCards']>(),
  getLatestUnitCardCertifications:
    vi.fn<UnitCardStorage['getLatestUnitCardCertifications']>(),
  certifyUnitCardVersions: vi.fn<UnitCardStorage['certifyUnitCardVersions']>(),
  ...overrides,
});

const stubRenderer: CommandCardRendererPort = {
  renderCommandCard: vi
    .fn<CommandCardRendererPort['renderCommandCard']>()
    .mockResolvedValue({
      success: true,
      data: Buffer.from('<svg/>'),
    }),
};

const stubAssetStorage: AssetStorage = {
  putImmutable: vi
    .fn<AssetStorage['putImmutable']>()
    .mockResolvedValue({ kind: 'written' }),
  objectExists: vi.fn<AssetStorage['objectExists']>().mockResolvedValue(true),
};

interface CreateUseCasesOverrides {
  commandCardStorage?: CommandCardStorage;
  unitCardStorage?: UnitCardStorage;
  commandCardRenderer?: CommandCardRendererPort;
  assetStorage?: AssetStorage;
}

const createUseCases = (
  overrides: CreateUseCasesOverrides = {},
): CommandCardUseCasesPort =>
  createCommandCardUseCases({
    commandCardStorage: overrides.commandCardStorage ?? buildStorage(),
    unitCardStorage: overrides.unitCardStorage ?? buildUnitStorage(),
    commandCardRenderer: overrides.commandCardRenderer ?? stubRenderer,
    assetStorage: overrides.assetStorage ?? stubAssetStorage,
  });

describe('createCommandCardVersion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(
    'projects assets after inserting the version row',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const inserted = { ...validCardA, version: '1.0.1' };
      const createVersion = vi
        .fn<CommandCardStorage['createCommandCardVersion']>()
        .mockResolvedValue({ success: true, data: inserted });

      const useCases = createUseCases({
        commandCardStorage: buildStorage({
          createCommandCardVersion: createVersion,
        }),
      });

      const result = await useCases.createCommandCardVersion(validCardA);

      expect(result).toStrictEqual({ success: true, data: inserted });
      expect(stubRenderer.renderCommandCard).toHaveBeenCalledTimes(3);
      expect(stubAssetStorage.putImmutable).toHaveBeenCalledTimes(3);
    },
  );

  it(
    'deletes the version row when projection fails',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const inserted = { ...validCardA, version: '1.0.1' };
      const createVersion = vi
        .fn<CommandCardStorage['createCommandCardVersion']>()
        .mockResolvedValue({ success: true, data: inserted });
      const deleteVersion = vi
        .fn<CommandCardStorage['deleteCommandCardVersion']>()
        .mockResolvedValue({ success: true, data: undefined });
      const renderer: CommandCardRendererPort = {
        renderCommandCard: vi
          .fn<CommandCardRendererPort['renderCommandCard']>()
          .mockResolvedValue({
            success: false,
            message: 'render failed',
            status: 500,
          }),
      };

      const useCases = createUseCases({
        commandCardStorage: buildStorage({
          createCommandCardVersion: createVersion,
          deleteCommandCardVersion: deleteVersion,
        }),
        commandCardRenderer: renderer,
      });

      const result = await useCases.createCommandCardVersion(validCardA);

      expect(result).toStrictEqual({
        success: false,
        message: 'render failed',
        status: 500,
      });
      expect(deleteVersion).toHaveBeenCalledWith(inserted);
    },
  );
});

describe('previewCommandCard', () => {
  it(
    'resolves unit names from storage before rendering',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const unitIds = getCommandCardUnitIds(validCardA);
      const getUnitCardsByIds = vi
        .fn<UnitCardStorage['getUnitCardsByIds']>()
        .mockResolvedValue({
          success: true,
          data: unitIds.map((id) => ({
            ...tempUnits[0],
            id,
            name: `Unit-${id}`,
          })),
        });
      const renderer: CommandCardRendererPort = {
        renderCommandCard: vi
          .fn<CommandCardRendererPort['renderCommandCard']>()
          .mockResolvedValue({
            success: true,
            data: Buffer.from('<svg/>'),
          }),
      };

      const useCases = createUseCases({
        unitCardStorage: buildUnitStorage({ getUnitCardsByIds }),
        commandCardRenderer: renderer,
      });

      const result = await useCases.previewCommandCard(validCardA);

      expect(getUnitCardsByIds).toHaveBeenCalledWith(unitIds);
      expect(renderer.renderCommandCard).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({ success: true, data: '<svg/>' });
    },
  );
});

describe('updateCommandCardCertifications', () => {
  it(
    'certifies valid latest versions and returns the post-write state by entity id',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const certify = vi
        .fn<CommandCardStorage['certifyCommandCardVersions']>()
        .mockResolvedValue({
          success: true,
          data: undefined,
        });
      const getStatuses = vi
        .fn<CommandCardStorage['getLatestCommandCardCertifications']>()
        .mockResolvedValueOnce({
          success: true,
          data: [status(validCardA, false), status(validCardB, false)],
        })
        .mockResolvedValueOnce({
          success: true,
          data: [status(validCardA, true), status(validCardB, true)],
        });

      const useCases = createUseCases({
        commandCardStorage: buildStorage({
          getLatestCommandCardCertifications: getStatuses,
          certifyCommandCardVersions: certify,
        }),
      });

      const result = await useCases.updateCommandCardCertifications();

      expect(certify).toHaveBeenCalledWith([validCardA.id, validCardB.id]);
      expect(getStatuses).toHaveBeenCalledTimes(2);
      expect(result).toStrictEqual({
        success: true,
        data: { certified: [validCardA.id, validCardB.id], uncertified: [] },
      });
    },
  );

  it(
    'skips already-certified versions without certifying them again',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const certify = vi
        .fn<CommandCardStorage['certifyCommandCardVersions']>()
        .mockResolvedValue({
          success: true,
          data: undefined,
        });
      const getStatuses = vi
        .fn<CommandCardStorage['getLatestCommandCardCertifications']>()
        .mockResolvedValueOnce({
          success: true,
          data: [status(validCardA, true), status(validCardB, false)],
        })
        .mockResolvedValueOnce({
          success: true,
          data: [status(validCardA, true), status(validCardB, true)],
        });

      const useCases = createUseCases({
        commandCardStorage: buildStorage({
          getLatestCommandCardCertifications: getStatuses,
          certifyCommandCardVersions: certify,
        }),
      });

      const result = await useCases.updateCommandCardCertifications();

      expect(certify).toHaveBeenCalledWith([validCardB.id]);
      expect(result).toStrictEqual({
        success: true,
        data: { certified: [validCardA.id, validCardB.id], uncertified: [] },
      });
    },
  );

  it(
    'excludes schema-invalid cards from the write and reports them uncertified',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const certify = vi
        .fn<CommandCardStorage['certifyCommandCardVersions']>()
        .mockResolvedValue({
          success: true,
          data: undefined,
        });
      const getStatuses = vi
        .fn<CommandCardStorage['getLatestCommandCardCertifications']>()
        .mockResolvedValueOnce({
          success: true,
          data: [status(validCardA, false), status(invalidCard, false)],
        })
        .mockResolvedValueOnce({
          success: true,
          data: [status(validCardA, true), status(invalidCard, false)],
        });

      const useCases = createUseCases({
        commandCardStorage: buildStorage({
          getLatestCommandCardCertifications: getStatuses,
          certifyCommandCardVersions: certify,
        }),
      });

      const result = await useCases.updateCommandCardCertifications();

      expect(certify).toHaveBeenCalledWith([validCardA.id]);
      expect(result).toStrictEqual({
        success: true,
        data: { certified: [validCardA.id], uncertified: [invalidCard.id] },
      });
    },
  );

  it(
    're-renders missing assets before certifying',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      let putCount = 0;
      const assetStorage: AssetStorage = {
        putImmutable: vi
          .fn<AssetStorage['putImmutable']>()
          .mockImplementation(async () => {
            putCount += 1;
            return { kind: 'written' };
          }),
        objectExists: vi
          .fn<AssetStorage['objectExists']>()
          .mockImplementation(async () => putCount >= 3),
      };
      const certify = vi
        .fn<CommandCardStorage['certifyCommandCardVersions']>()
        .mockResolvedValue({ success: true, data: undefined });
      const getStatuses = vi
        .fn<CommandCardStorage['getLatestCommandCardCertifications']>()
        .mockResolvedValueOnce({
          success: true,
          data: [status(validCardA, false)],
        })
        .mockResolvedValueOnce({
          success: true,
          data: [status(validCardA, true)],
        });
      const renderer: CommandCardRendererPort = {
        renderCommandCard: vi
          .fn<CommandCardRendererPort['renderCommandCard']>()
          .mockResolvedValue({
            success: true,
            data: Buffer.from('<svg/>'),
          }),
      };

      const useCases = createUseCases({
        commandCardStorage: buildStorage({
          getLatestCommandCardCertifications: getStatuses,
          certifyCommandCardVersions: certify,
        }),
        commandCardRenderer: renderer,
        assetStorage,
      });

      await useCases.updateCommandCardCertifications();

      expect(renderer.renderCommandCard).toHaveBeenCalledTimes(3);
      expect(assetStorage.putImmutable).toHaveBeenCalledTimes(3);
      expect(certify).toHaveBeenCalledWith([validCardA.id]);
    },
  );

  it(
    'propagates a failure from the initial read without writing',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const certify = vi.fn<CommandCardStorage['certifyCommandCardVersions']>();
      const useCases = createUseCases({
        commandCardStorage: buildStorage({
          getLatestCommandCardCertifications: vi
            .fn<CommandCardStorage['getLatestCommandCardCertifications']>()
            .mockResolvedValue({
              success: false,
              message: 'boom',
              status: 500,
            }),
          certifyCommandCardVersions: certify,
        }),
      });

      const result = await useCases.updateCommandCardCertifications();

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
        .fn<CommandCardStorage['getLatestCommandCardCertifications']>()
        .mockResolvedValue({
          success: true,
          data: [status(validCardA, false)],
        });
      const useCases = createUseCases({
        commandCardStorage: buildStorage({
          getLatestCommandCardCertifications: getStatuses,
          certifyCommandCardVersions: vi
            .fn<CommandCardStorage['certifyCommandCardVersions']>()
            .mockResolvedValue({
              success: false,
              message: 'no rules',
              status: 500,
            }),
        }),
      });

      const result = await useCases.updateCommandCardCertifications();

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

      const useCases = createUseCases({
        commandCardStorage: buildStorage({
          getLatestCommandCardCertifications: vi
            .fn<CommandCardStorage['getLatestCommandCardCertifications']>()
            .mockResolvedValueOnce({
              success: true,
              data: [status(validCardA, false)],
            })
            .mockResolvedValueOnce({
              success: false,
              message: 'read failed',
              status: 500,
            }),
          certifyCommandCardVersions: vi
            .fn<CommandCardStorage['certifyCommandCardVersions']>()
            .mockResolvedValue({ success: true, data: undefined }),
        }),
      });

      const result = await useCases.updateCommandCardCertifications();

      expect(result).toStrictEqual({
        success: false,
        message: 'read failed',
        status: 500,
      });
    },
  );
});
