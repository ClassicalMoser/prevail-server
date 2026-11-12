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

      const inserted = { ...commandCardNamingUnits, version: '1.0.1' };
      const createVersion = vi
        .fn<CommandCardStorage['createCommandCardVersion']>()
        .mockResolvedValue({ success: true, data: inserted });

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
      expect(stubRenderer.renderCommandCard).toHaveBeenCalledTimes(3);
      expect(stubAssets.putImmutable).toHaveBeenCalledTimes(3);
    },
  );

  it(
    'deletes the version row when projection fails',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const inserted = { ...commandCardNamingUnits, version: '1.0.1' };
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
      expect(deleteVersion).toHaveBeenCalledWith(inserted);
    },
  );
});
