import type {
  CommandCardRendererPort,
  StoragePort,
  UseCasesPort,
} from '@ports';
import { createCommandCardUseCases } from './cards';

const createUseCasesRoot = (
  storagePort: StoragePort,
  commandCardRenderer: CommandCardRendererPort,
): UseCasesPort => ({
  commandCardUseCases: createCommandCardUseCases(
    storagePort.commandCardStorage,
    commandCardRenderer,
  ),
});

export { createUseCasesRoot };
