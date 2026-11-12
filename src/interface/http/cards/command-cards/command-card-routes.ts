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
  // Public: the current catalog is browsable without signing in.
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
  // POST because the list of ids travels in a body, not the URL; still a read.
  implementPostRoute(getCommandCardsByIdsContract, logger, {
    handler: (request) =>
      commandCardUseCases.getCommandCardsByIds(request.body.ids),
  }),
  // Reserves a new card id for an author to fill by saving a version.
  implementPostRoute(createEmptyCommandCardContract, logger, {
    handler: () => commandCardUseCases.createEmptyCommandCard(),
  }),
  // Clears reserved cards that never received a version; answers 204.
  implementDeleteRoute(deleteEmptyCommandCardsContract, logger, {
    handler: () => commandCardUseCases.deleteEmptyCommandCards(),
  }),
  implementPostRoute(createCommandCardVersionContract, logger, {
    handler: (request) =>
      commandCardUseCases.createCommandCardVersion(request.body),
  }),
  // Takes no input: recomputes certification of the latest card versions.
  implementPostRoute(updateCommandCardCertificationsContract, logger, {
    handler: () => commandCardUseCases.updateCommandCardCertifications(),
  }),
  // Renders the card the author sent as an SVG, without saving it.
  implementMediaPostRoute(previewCommandCardContract, logger, {
    handler: (request) => commandCardUseCases.previewCommandCard(request.body),
  }),
];

export { createCommandCardRoutes };
