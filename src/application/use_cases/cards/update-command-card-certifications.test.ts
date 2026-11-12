import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type {
  AssetStorage,
  CommandCardRendererPort,
  CommandCardStorage,
} from '@ports';
import type { CommandCardUseCasesDeps } from './command-card-use-cases-deps';
import { updateCommandCardCertifications } from './update-command-card-certifications';
import {
  certificationStatus,
  commandCardNamingUnits,
  commandCardStorageDouble,
  namedUnitCardStorage,
  otherValidCommandCard,
  stubAssetStorage,
  stubCommandCardRenderer,
  tempCommandCards,
} from '@testing';

const stubRenderer = stubCommandCardRenderer();
const stubAssets = stubAssetStorage();

const deps = (
  overrides: Partial<CommandCardUseCasesDeps> = {},
): CommandCardUseCasesDeps => ({
  commandCardStorage: commandCardStorageDouble(),
  unitCardStorage: namedUnitCardStorage(),
  commandCardRenderer: stubRenderer,
  assetStorage: stubAssets,
  ...overrides,
});

const invalidCard = {
  ...tempCommandCards[2],
  command: undefined as unknown as CommandCard['command'], // unreachable for a real card; forces schema rejection
};

describe('updateCommandCardCertifications function', () => {
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
      // Two valid latest versions, both uncertified at first. The second read, after the write, shows both certified.
      const getStatuses = vi
        .fn<CommandCardStorage['getLatestCommandCardCertifications']>()
        .mockResolvedValueOnce({
          success: true,
          data: [
            certificationStatus(commandCardNamingUnits, false),
            certificationStatus(otherValidCommandCard, false),
          ],
        })
        .mockResolvedValueOnce({
          success: true,
          data: [
            certificationStatus(commandCardNamingUnits, true),
            certificationStatus(otherValidCommandCard, true),
          ],
        });

      const useCaseDeps = deps({
        commandCardStorage: commandCardStorageDouble({
          getLatestCommandCardCertifications: getStatuses,
          certifyCommandCardVersions: certify,
        }),
      });

      const result = await updateCommandCardCertifications(useCaseDeps);

      // Every uncertified valid card is written, and the answer is the post-write read (two reads) by card id.
      expect(certify).toHaveBeenCalledWith([
        commandCardNamingUnits.id,
        otherValidCommandCard.id,
      ]);
      expect(getStatuses).toHaveBeenCalledTimes(2);
      expect(result).toStrictEqual({
        success: true,
        data: {
          certified: [commandCardNamingUnits.id, otherValidCommandCard.id],
          uncertified: [],
        },
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
      // One card is already certified and the other is not; after the write both are.
      const getStatuses = vi
        .fn<CommandCardStorage['getLatestCommandCardCertifications']>()
        .mockResolvedValueOnce({
          success: true,
          data: [
            certificationStatus(commandCardNamingUnits, true),
            certificationStatus(otherValidCommandCard, false),
          ],
        })
        .mockResolvedValueOnce({
          success: true,
          data: [
            certificationStatus(commandCardNamingUnits, true),
            certificationStatus(otherValidCommandCard, true),
          ],
        });

      const useCaseDeps = deps({
        commandCardStorage: commandCardStorageDouble({
          getLatestCommandCardCertifications: getStatuses,
          certifyCommandCardVersions: certify,
        }),
      });

      const result = await updateCommandCardCertifications(useCaseDeps);

      // Only the uncertified card is written: a certified card is not certified again.
      expect(certify).toHaveBeenCalledWith([otherValidCommandCard.id]);
      expect(result).toStrictEqual({
        success: true,
        data: {
          certified: [commandCardNamingUnits.id, otherValidCommandCard.id],
          uncertified: [],
        },
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
      // One valid card and one the rules schema rejects (see the invalid fixture); neither is certified at first, and after the write only the valid one is.
      const getStatuses = vi
        .fn<CommandCardStorage['getLatestCommandCardCertifications']>()
        .mockResolvedValueOnce({
          success: true,
          data: [
            certificationStatus(commandCardNamingUnits, false),
            certificationStatus(invalidCard, false),
          ],
        })
        .mockResolvedValueOnce({
          success: true,
          data: [
            certificationStatus(commandCardNamingUnits, true),
            certificationStatus(invalidCard, false),
          ],
        });

      const useCaseDeps = deps({
        commandCardStorage: commandCardStorageDouble({
          getLatestCommandCardCertifications: getStatuses,
          certifyCommandCardVersions: certify,
        }),
      });

      const result = await updateCommandCardCertifications(useCaseDeps);

      // Only the valid card is written; the schema-invalid one can never be played, so it is reported uncertified.
      expect(certify).toHaveBeenCalledWith([commandCardNamingUnits.id]);
      expect(result).toStrictEqual({
        success: true,
        data: {
          certified: [commandCardNamingUnits.id],
          uncertified: [invalidCard.id],
        },
      });
    },
  );

  it(
    're-renders missing assets before certifying',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The asset store reports a file as present only after three have been written, so every asset looks missing at first.
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
          data: [certificationStatus(commandCardNamingUnits, false)],
        })
        .mockResolvedValueOnce({
          success: true,
          data: [certificationStatus(commandCardNamingUnits, true)],
        });
      // A renderer that draws a tiny SVG, so re-rendering can succeed.
      const renderer: CommandCardRendererPort = {
        renderCommandCard: vi
          .fn<CommandCardRendererPort['renderCommandCard']>()
          .mockResolvedValue({
            success: true,
            data: Buffer.from('<svg/>'),
          }),
      };

      const useCaseDeps = deps({
        commandCardStorage: commandCardStorageDouble({
          getLatestCommandCardCertifications: getStatuses,
          certifyCommandCardVersions: certify,
        }),
        commandCardRenderer: renderer,
        assetStorage,
      });

      // The result is not the point here; the effects on the renderer, the assets and the write are.
      await updateCommandCardCertifications(useCaseDeps);

      // A card with missing assets is drawn and stored (three assets) before it is certified.
      expect(renderer.renderCommandCard).toHaveBeenCalledTimes(3);
      expect(assetStorage.putImmutable).toHaveBeenCalledTimes(3);
      expect(certify).toHaveBeenCalledWith([commandCardNamingUnits.id]);
    },
  );

  it(
    'propagates a failure from the initial read without writing',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // Certify is never programmed, because it must not run when the first read fails.
      const certify = vi.fn<CommandCardStorage['certifyCommandCardVersions']>();
      const useCaseDeps = deps({
        commandCardStorage: commandCardStorageDouble({
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

      const result = await updateCommandCardCertifications(useCaseDeps);

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
        .fn<CommandCardStorage['getLatestCommandCardCertifications']>()
        .mockResolvedValue({
          success: true,
          data: [certificationStatus(commandCardNamingUnits, false)],
        });
      const useCaseDeps = deps({
        commandCardStorage: commandCardStorageDouble({
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

      const result = await updateCommandCardCertifications(useCaseDeps);

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
        commandCardStorage: commandCardStorageDouble({
          getLatestCommandCardCertifications: vi
            .fn<CommandCardStorage['getLatestCommandCardCertifications']>()
            .mockResolvedValueOnce({
              success: true,
              data: [certificationStatus(commandCardNamingUnits, false)],
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

      const result = await updateCommandCardCertifications(useCaseDeps);

      expect(result).toStrictEqual({
        success: false,
        message: 'read failed',
        status: 500,
      });
    },
  );
});
