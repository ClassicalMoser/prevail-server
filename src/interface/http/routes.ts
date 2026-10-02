import type { LoggerPort, RouteRegistry, UseCasesPort } from '@ports';
import { createOwnedArmyRoutes } from './armies';
import { createCommandCardRoutes, createUnitCardRoutes } from './cards';
import { createGameRoutes } from './games';

/**
 * Assemble every HTTP route registry for the process.
 *
 * @param useCases - Aggregate use-case port tree.
 * @param logger - Logger passed into each route implementer.
 * @returns Flat registry registered by composition.
 */
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
