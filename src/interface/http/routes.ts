import type { LoggerPort, RouteRegistry, UseCasesPort } from '@ports';
import { createCommandCardRoutes, createUnitCardRoutes } from './cards';

const createRoutes = (
  useCases: UseCasesPort,
  logger: LoggerPort,
): RouteRegistry => [
  ...createCommandCardRoutes(useCases.commandCardUseCases, logger),
  ...createUnitCardRoutes(useCases.unitCardUseCases, logger),
];

export { createRoutes };
