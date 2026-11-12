import type { CommandCardRendererPort, CommandCardStorage } from '@ports';
import type { CommandCardUseCasesDeps } from './command-card-use-cases-deps';
import { createCommandCardVersion } from './create-command-card-version';
import {
  commandCardNamingUnits,
  commandCardStorageDouble,
  namedUnitCardStorage,
  stubAssetStorage,
  stubCommandCardRenderer,
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

describe('createCommandCardVersion function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(
    'projects assets after inserting the version row',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The storage mock returns the row as stored, with the next version number.
      const inserted = { ...commandCardNamingUnits, version: '1.0.1' };
      const createVersion = vi
        .fn<CommandCardStorage['createCommandCardVersion']>()
        .mockResolvedValue({ success: true, data: inserted });

      // Renderer and asset storage are shared stubs that count calls, so the projection can be counted.
      const useCaseDeps = deps({
        commandCardStorage: commandCardStorageDouble({
          createCommandCardVersion: createVersion,
        }),
      });

      const result = await createCommandCardVersion(
        useCaseDeps,
        commandCardNamingUnits,
      );

      expect(result).toStrictEqual({ success: true, data: inserted });
      // The same number of renders and stored assets: each projected asset is drawn once and stored once.
      expect(stubRenderer.renderCommandCard).toHaveBeenCalledTimes(3);
      expect(stubAssets.putImmutable).toHaveBeenCalledTimes(3);
    },
  );

  it(
    'deletes the version row when projection fails',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The version row is inserted successfully, so there is a row to take back.
      const inserted = { ...commandCardNamingUnits, version: '1.0.1' };
      const createVersion = vi
        .fn<CommandCardStorage['createCommandCardVersion']>()
        .mockResolvedValue({ success: true, data: inserted });
      // The rollback path: a version row whose assets did not project must be removed.
      const deleteVersion = vi
        .fn<CommandCardStorage['deleteCommandCardVersion']>()
        .mockResolvedValue({ success: true, data: undefined });
      // A renderer that fails, so projection after the insert cannot complete.
      const renderer: CommandCardRendererPort = {
        renderCommandCard: vi
          .fn<CommandCardRendererPort['renderCommandCard']>()
          .mockResolvedValue({
            success: false,
            message: 'render failed',
            status: 500,
          }),
      };

      const useCaseDeps = deps({
        commandCardStorage: commandCardStorageDouble({
          createCommandCardVersion: createVersion,
          deleteCommandCardVersion: deleteVersion,
        }),
        commandCardRenderer: renderer,
      });

      const result = await createCommandCardVersion(
        useCaseDeps,
        commandCardNamingUnits,
      );

      expect(result).toStrictEqual({
        success: false,
        message: 'render failed',
        status: 500,
      });
      // The failure is reported as the renderer said, and the half-created version row is deleted.
      expect(deleteVersion).toHaveBeenCalledWith(inserted);
    },
  );
});
