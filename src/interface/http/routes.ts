import type { CommandCardStorage, RouteDefinition } from '@ports';
import { createCommandCardRoutes } from './cards';

const createRoutes = (
  commandCardStorage: CommandCardStorage,
): RouteDefinition[] => [...createCommandCardRoutes(commandCardStorage)];

export { createRoutes };
