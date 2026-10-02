import assert from 'node:assert/strict';
import { tempCommandCards } from '@classicalmoser/prevail-rules/domain';
import type {
  AssetStorage,
  CommandCardRendererPort,
  DataErrorSignature,
  UploadResult,
} from '@ports';
import type { UnitIdToNameMap } from '../print/unit-id-to-name-map';
import { getCommandCardUnitIds } from '../print/get-command-card-unit-ids';
import { commandCardProjectOps } from './command-card-project-ops';

const card = tempCommandCards[0];
assert.ok(card !== undefined);

const placeholderUnitIdToNameMap = (unitIds: string[]): UnitIdToNameMap =>
  new Map(unitIds.map((id) => [id, `NAME_${id.slice(0, 5)}...`]));

const assetStorage = (): AssetStorage => ({
  objectExists: async (): Promise<boolean> => false,
  putImmutable: async (): Promise<UploadResult> => ({ kind: 'written' }),
});

describe('commandCardProjectOps function', () => {
  it(
    'renders through the command card renderer after name substitution',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      let renderedWithNames = false;
      const commandCardRenderer: CommandCardRendererPort = {
        renderCommandCard: async (
          printCard,
        ): Promise<DataErrorSignature<Buffer>> => {
          renderedWithNames =
            printCard.command.restrictions.unitRestrictions.every((value) =>
              value.startsWith('NAME_'),
            );
          return { data: Buffer.from('svg'), success: true };
        },
      };

      const ops = commandCardProjectOps({
        assetStorage: assetStorage(),
        commandCardRenderer,
        unitIdToNameMap: placeholderUnitIdToNameMap(
          getCommandCardUnitIds(card),
        ),
      });

      const [target] = ops.targets(card);
      assert.ok(target !== undefined);
      const result = await ops.render(card, target);

      expect(result.success).toBe(true);
      expect(renderedWithNames).toBe(true);
    },
  );
});
