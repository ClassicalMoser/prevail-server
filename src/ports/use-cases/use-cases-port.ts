import type { CommandCardUseCasesPort } from './command-card-use-cases';
import type { GameSessionUseCasesPort } from './game-session-use-cases';
import type { OwnedArmyUseCasesPort } from './owned-army-use-cases';
import type { UnitCardUseCasesPort } from './unit-card-use-cases';

interface UseCasesPort {
  commandCardUseCases: CommandCardUseCasesPort;
  unitCardUseCases: UnitCardUseCasesPort;
  ownedArmyUseCases: OwnedArmyUseCasesPort;
  gameSessionUseCases: GameSessionUseCasesPort;
}

export type { UseCasesPort };
