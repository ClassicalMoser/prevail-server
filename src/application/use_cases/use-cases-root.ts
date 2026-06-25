import type {
  CommandCardRendererPort,
  StoragePort,
  UnitCardRendererPort,
  UseCasesPort,
} from '@ports';
import { createCommandCardUseCases, createUnitCardUseCases } from './cards';

const createUseCasesRoot = (
  storagePort: StoragePort,
  commandCardRenderer: CommandCardRendererPort,
  unitCardRenderer: UnitCardRendererPort,
): UseCasesPort => ({
  commandCardUseCases: createCommandCardUseCases(
    storagePort.commandCardStorage,
    commandCardRenderer,
  ),
  unitCardUseCases: createUnitCardUseCases(
    storagePort.unitCardStorage,
    unitCardRenderer,
  ),
});

export { createUseCasesRoot };
