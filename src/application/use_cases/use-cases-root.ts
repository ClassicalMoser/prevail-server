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

/** The ports the whole use-case tree is built from. */
interface UseCasesRootDeps {
  storagePort: StoragePort;
  commandCardRenderer: CommandCardRendererPort;
  unitCardRenderer: UnitCardRendererPort;
  assetStorage: AssetStorage;
  gameSessionUseCases: GameSessionUseCasesPort;
}

/**
 * Wire catalog, army, and game-session use cases onto one port tree.
 *
 * Composition owns the wiring; individual create*UseCases factories stay
 * focused on one subdomain.
 *
 * @param deps - Storage, renderers, asset store, and live game session.
 * @returns The aggregate use-cases port consumed by HTTP/WS registries.
 */
const createUseCasesRoot = (deps: UseCasesRootDeps): UseCasesPort => ({
  // Command cards need unit storage too: a printed card shows unit names.
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
  // Army storage alone: the army use cases take no card ports.
  ownedArmyUseCases: createOwnedArmyUseCases({
    ownedArmyStorage: deps.storagePort.ownedArmyStorage,
  }),
  // The live game session is built elsewhere and passed through untouched.
  gameSessionUseCases: deps.gameSessionUseCases,
});

export type { UseCasesRootDeps };
export { createUseCasesRoot };
