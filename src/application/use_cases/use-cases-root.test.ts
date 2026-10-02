import type {
  AssetStorage,
  CommandCardRendererPort,
  GameSessionUseCasesPort,
  StoragePort,
  UnitCardRendererPort,
} from '@ports';
import { createUseCasesRoot } from './use-cases-root';

const storagePort = {
  commandCardStorage: {},
  ownedArmyStorage: {},
  unitCardStorage: {},
  userStorage: {},
} as StoragePort; // factory wiring only; use-case methods are not invoked

describe('createUseCasesRoot function', () => {
  it(
    'assembles card, army, and game session use-case ports',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const root = createUseCasesRoot({
        assetStorage: {} as AssetStorage, // unused until a use case runs
        commandCardRenderer: {} as CommandCardRendererPort, // unused until a use case runs
        gameSessionUseCases: {
          createVsBotGame: async () => ({ data: 'g', success: true }),
        } as unknown as GameSessionUseCasesPort, // partial; root only stores the reference
        storagePort,
        unitCardRenderer: {} as UnitCardRendererPort, // unused until a use case runs
      });

      expect(root.gameSessionUseCases.createVsBotGame).toBeTypeOf('function');
      expect(root.commandCardUseCases).toBeDefined();
      expect(root.unitCardUseCases).toBeDefined();
      expect(root.ownedArmyUseCases).toBeDefined();
    },
  );
});
