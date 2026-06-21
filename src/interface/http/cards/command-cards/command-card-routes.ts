import {
  getCommandCardByIdContract,
  getCurrentCommandCardsContract,
} from '@classicalmoser/prevail-contracts/contracts';
import type { CommandCardUseCasesPort, RouteRegistry } from '@ports';
import { implementGetRoute } from '@interface/http/route-definitions';

const createCommandCardRoutes = (
  commandCardUseCases: CommandCardUseCasesPort,
): RouteRegistry => [
  implementGetRoute(getCurrentCommandCardsContract, {
    handler: () => commandCardUseCases.getCurrentCommandCards(),
  }),
  implementGetRoute(getCommandCardByIdContract, {
    handler: (request) =>
      commandCardUseCases.getCommandCardById(request.params.id),
  }),
];

export { createCommandCardRoutes };
