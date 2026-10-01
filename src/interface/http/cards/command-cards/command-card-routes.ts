import {
  updateCommandCardCertificationsContract,
  createCommandCardVersionContract,
  createEmptyCommandCardContract,
  deleteEmptyCommandCardsContract,
  getAllCommandCardsContract,
  getCommandCardByIdContract,
  getCommandCardsByIdsContract,
  getCurrentCommandCardsContract,
  previewCommandCardContract,
} from '@classicalmoser/prevail-contracts/contracts';
import type {
  CommandCardUseCasesPort,
  LoggerPort,
  RouteRegistry,
} from '@ports';
import {
  implementDeleteRoute,
  implementGetRoute,
  implementMediaPostRoute,
  implementPostRoute,
} from '@interface/http/route-definitions';

/**
 * HTTP routes for the command-card catalog.
 *
 * Reads are public. Mutations require a subject. Preview returns an SVG body
 * through the media post helper instead of a JSON envelope.
 *
 * @param commandCardUseCases - Command-card use cases.
 * @param logger - Passed into the route helpers for unexpected failures.
 * @returns The command-card route registry.
 */
const createCommandCardRoutes = (
  commandCardUseCases: CommandCardUseCasesPort,
  logger: LoggerPort,
): RouteRegistry => [
  implementGetRoute(getCurrentCommandCardsContract, logger, {
    handler: () => commandCardUseCases.getCurrentCommandCards(),
  }),
  implementGetRoute(getAllCommandCardsContract, logger, {
    handler: () => commandCardUseCases.getAllCommandCards(),
  }),
  implementGetRoute(getCommandCardByIdContract, logger, {
    handler: (request) =>
      commandCardUseCases.getCommandCardById(request.params.id),
  }),
  implementPostRoute(getCommandCardsByIdsContract, logger, {
    handler: (request) =>
      commandCardUseCases.getCommandCardsByIds(request.body.ids),
  }),
  implementPostRoute(createEmptyCommandCardContract, logger, {
    handler: () => commandCardUseCases.createEmptyCommandCard(),
  }),
  implementDeleteRoute(deleteEmptyCommandCardsContract, logger, {
    handler: () => commandCardUseCases.deleteEmptyCommandCards(),
  }),
  implementPostRoute(createCommandCardVersionContract, logger, {
    handler: (request) =>
      commandCardUseCases.createCommandCardVersion(request.body),
  }),
  implementPostRoute(updateCommandCardCertificationsContract, logger, {
    handler: () => commandCardUseCases.updateCommandCardCertifications(),
  }),
  implementMediaPostRoute(previewCommandCardContract, logger, {
    handler: (request) => commandCardUseCases.previewCommandCard(request.body),
  }),
];

export { createCommandCardRoutes };
