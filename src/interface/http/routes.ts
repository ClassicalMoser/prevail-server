import type { LoggerPort, RouteRegistry, UseCasesPort } from '@ports';
import { createOwnedArmyRoutes } from './armies';
import { createCommandCardRoutes, createUnitCardRoutes } from './cards';

const createRoutes = (
  useCases: UseCasesPort,
  logger: LoggerPort,
): RouteRegistry => [
  ...createCommandCardRoutes(useCases.commandCardUseCases, logger),
  ...createUnitCardRoutes(useCases.unitCardUseCases, logger),
  ...createOwnedArmyRoutes(useCases.ownedArmyUseCases, logger),
];

export { createRoutes };
