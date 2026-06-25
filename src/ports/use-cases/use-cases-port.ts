import type { CommandCardUseCasesPort } from './command-card-use-cases';
import type { UnitCardUseCasesPort } from './unit-card-use-cases';

interface UseCasesPort {
  commandCardUseCases: CommandCardUseCasesPort;
  unitCardUseCases: UnitCardUseCasesPort;
}

export type { UseCasesPort };
