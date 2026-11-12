import { getCommandCardUnitIds } from '@application/composable';
import type { CommandCardRendererPort, UnitCardStorage } from '@ports';
import type { CommandCardUseCasesDeps } from './command-card-use-cases-deps';
import { previewCommandCard } from './preview-command-card';
import {
  commandCardNamingUnits,
  commandCardStorageDouble,
  namedUnitCardStorage,
  stubAssetStorage,
  stubCommandCardRenderer,
  tempUnits,
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

describe('previewCommandCard function', () => {
  it(
    'resolves unit names from storage before rendering',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const unitIds = getCommandCardUnitIds(commandCardNamingUnits);
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

      const useCaseDeps = deps({
        unitCardStorage: namedUnitCardStorage({ getUnitCardsByIds }),
        commandCardRenderer: renderer,
      });

      const result = await previewCommandCard(
        useCaseDeps,
        commandCardNamingUnits,
      );

      expect(getUnitCardsByIds).toHaveBeenCalledWith(unitIds);
      expect(renderer.renderCommandCard).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({ success: true, data: '<svg/>' });
    },
  );
});
