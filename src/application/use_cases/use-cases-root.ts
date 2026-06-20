import type { StoragePort, UseCasesPort } from '@ports';
import { createCommandCardUseCases } from './cards';

const createUseCasesRoot = (storagePort: StoragePort): UseCasesPort => ({
  commandCardUseCases: createCommandCardUseCases(
    storagePort.commandCardStorage,
  ),
});

export { createUseCasesRoot };
