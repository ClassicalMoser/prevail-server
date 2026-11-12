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

      // The card names units by id; a preview must print their names, not ids.
      const unitIds = getCommandCardUnitIds(commandCardNamingUnits);
      // Storage answers each id with a unit of that id named `Unit-<id>`.
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
      // A renderer that returns a tiny SVG, so the preview can be read back as text.
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

      // Names were looked up for exactly the card's unit ids, and the card was drawn once.
      expect(getUnitCardsByIds).toHaveBeenCalledWith(unitIds);
      expect(renderer.renderCommandCard).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({ success: true, data: '<svg/>' });
    },
  );
});
