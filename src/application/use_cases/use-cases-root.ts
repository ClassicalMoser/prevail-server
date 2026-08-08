import type {
  AssetStorage,
  CommandCardRendererPort,
  GameSessionUseCasesPort,
  StoragePort,
  UnitCardRendererPort,
  UseCasesPort,
} from '@ports';
import { createOwnedArmyUseCases } from './armies';
import { createCommandCardUseCases, createUnitCardUseCases } from './cards';

interface UseCasesRootDeps {
  storagePort: StoragePort;
  commandCardRenderer: CommandCardRendererPort;
  unitCardRenderer: UnitCardRendererPort;
  assetStorage: AssetStorage;
  gameSessionUseCases: GameSessionUseCasesPort;
}

const createUseCasesRoot = (deps: UseCasesRootDeps): UseCasesPort => ({
  commandCardUseCases: createCommandCardUseCases({
    commandCardStorage: deps.storagePort.commandCardStorage,
    unitCardStorage: deps.storagePort.unitCardStorage,
    commandCardRenderer: deps.commandCardRenderer,
    assetStorage: deps.assetStorage,
  }),
  unitCardUseCases: createUnitCardUseCases({
    unitCardStorage: deps.storagePort.unitCardStorage,
    unitCardRenderer: deps.unitCardRenderer,
    assetStorage: deps.assetStorage,
  }),
  ownedArmyUseCases: createOwnedArmyUseCases({
    ownedArmyStorage: deps.storagePort.ownedArmyStorage,
  }),
  gameSessionUseCases: deps.gameSessionUseCases,
});

export type { UseCasesRootDeps };
export { createUseCasesRoot };
