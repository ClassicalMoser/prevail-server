import type {
  AssetStorage,
  CommandCardRendererPort,
  StoragePort,
  UnitCardRendererPort,
  UseCasesPort,
} from '@ports';
import { createCommandCardUseCases, createUnitCardUseCases } from './cards';

interface UseCasesRootDeps {
  storagePort: StoragePort;
  commandCardRenderer: CommandCardRendererPort;
  unitCardRenderer: UnitCardRendererPort;
  assetStorage: AssetStorage;
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
});

export type { UseCasesRootDeps };
export { createUseCasesRoot };
