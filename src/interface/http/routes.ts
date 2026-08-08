import type { LoggerPort, RouteRegistry, UseCasesPort } from '@ports';
import { createOwnedArmyRoutes } from './armies';
import { createCommandCardRoutes, createUnitCardRoutes } from './cards';
import { createGameRoutes } from './games';

const createRoutes = (
  useCases: UseCasesPort,
  logger: LoggerPort,
): RouteRegistry => [
  ...createCommandCardRoutes(useCases.commandCardUseCases, logger),
  ...createUnitCardRoutes(useCases.unitCardUseCases, logger),
  ...createOwnedArmyRoutes(useCases.ownedArmyUseCases, logger),
  ...createGameRoutes(useCases.gameSessionUseCases, logger),
];

export { createRoutes };
