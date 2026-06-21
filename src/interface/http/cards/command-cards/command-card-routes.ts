import {
  certifyLatestCommandCardVersionsContract,
  createCommandCardVersionContract,
  createEmptyCommandCardContract,
  getCommandCardByIdContract,
  getCurrentCommandCardsContract,
  previewCommandCardContract,
} from '@classicalmoser/prevail-contracts/contracts';
import type { CommandCardUseCasesPort, RouteRegistry } from '@ports';
import {
  implementGetRoute,
  implementMediaPostRoute,
  implementPostRoute,
} from '@interface/http/route-definitions';

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
  implementPostRoute(createEmptyCommandCardContract, {
    handler: () => commandCardUseCases.createEmptyCommandCard(),
  }),
  implementPostRoute(createCommandCardVersionContract, {
    handler: (request) =>
      commandCardUseCases.createCommandCardVersion(request.body),
  }),
  implementPostRoute(certifyLatestCommandCardVersionsContract, {
    handler: () => commandCardUseCases.certifyLatestCommandCardVersions(),
  }),
  implementMediaPostRoute(previewCommandCardContract, {
    handler: (request) =>
      commandCardUseCases.previewCommandCard(request.body),
  }),
];

export { createCommandCardRoutes };
