import {
  updateUnitCardCertificationsContract,
  createEmptyUnitCardContract,
  createUnitCardVersionContract,
  deleteEmptyUnitCardsContract,
  getAllUnitCardsContract,
  getCurrentUnitCardsContract,
  getUnitCardByIdContract,
  getUnitCardsByIdsContract,
  previewUnitCardContract,
} from '@classicalmoser/prevail-contracts/contracts';
import type { LoggerPort, RouteRegistry, UnitCardUseCasesPort } from '@ports';
import {
  implementDeleteRoute,
  implementGetRoute,
  implementMediaPostRoute,
  implementPostRoute,
} from '@interface/http/route-definitions';

/**
 * HTTP routes for the unit-card catalog.
 *
 * Reads are public. Mutations require a subject. Preview returns an SVG body
 * through the media post helper instead of a JSON envelope.
 *
 * @param unitCardUseCases - Unit-card use cases.
 * @param logger - Passed into the route helpers for unexpected failures.
 * @returns The unit-card route registry.
 */
const createUnitCardRoutes = (
  unitCardUseCases: UnitCardUseCasesPort,
  logger: LoggerPort,
): RouteRegistry => [
  // Public: the current catalog is browsable without signing in.
  implementGetRoute(getCurrentUnitCardsContract, logger, {
    handler: () => unitCardUseCases.getCurrentUnitCards(),
  }),
  implementGetRoute(getAllUnitCardsContract, logger, {
    handler: () => unitCardUseCases.getAllUnitCards(),
  }),
  implementGetRoute(getUnitCardByIdContract, logger, {
    handler: (request) => unitCardUseCases.getUnitCardById(request.params.id),
  }),
  // POST because the list of ids travels in a body, not the URL; still a read.
  implementPostRoute(getUnitCardsByIdsContract, logger, {
    handler: (request) => unitCardUseCases.getUnitCardsByIds(request.body.ids),
  }),
  // Reserves a new card id for an author to fill by saving a version.
  implementPostRoute(createEmptyUnitCardContract, logger, {
    handler: () => unitCardUseCases.createEmptyUnitCard(),
  }),
  // Clears reserved cards that never received a version; answers 204.
  implementDeleteRoute(deleteEmptyUnitCardsContract, logger, {
    handler: () => unitCardUseCases.deleteEmptyUnitCards(),
  }),
  implementPostRoute(createUnitCardVersionContract, logger, {
    handler: (request) => unitCardUseCases.createUnitCardVersion(request.body),
  }),
  // Takes no input: recomputes certification of the latest card versions.
  implementPostRoute(updateUnitCardCertificationsContract, logger, {
    handler: () => unitCardUseCases.updateUnitCardCertifications(),
  }),
  // Renders the card the author sent as an SVG, without saving it.
  implementMediaPostRoute(previewUnitCardContract, logger, {
    handler: (request) => unitCardUseCases.previewUnitCard(request.body),
  }),
];

export { createUnitCardRoutes };
