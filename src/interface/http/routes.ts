import type { RouteRegistry, UseCasesPort } from '@ports';
import { createCommandCardRoutes } from './cards';

const createRoutes = (useCases: UseCasesPort): RouteRegistry => [
  ...createCommandCardRoutes(useCases.commandCardUseCases),
];

export { createRoutes };
