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

const createUnitCardRoutes = (
  unitCardUseCases: UnitCardUseCasesPort,
  logger: LoggerPort,
): RouteRegistry => [
  implementGetRoute(getCurrentUnitCardsContract, logger, {
    handler: () => unitCardUseCases.getCurrentUnitCards(),
  }),
  implementGetRoute(getAllUnitCardsContract, logger, {
    handler: () => unitCardUseCases.getAllUnitCards(),
  }),
  implementGetRoute(getUnitCardByIdContract, logger, {
    handler: (request) => unitCardUseCases.getUnitCardById(request.params.id),
  }),
  implementPostRoute(getUnitCardsByIdsContract, logger, {
    handler: (request) => unitCardUseCases.getUnitCardsByIds(request.body.ids),
  }),
  implementPostRoute(createEmptyUnitCardContract, logger, {
    handler: () => unitCardUseCases.createEmptyUnitCard(),
  }),
  implementDeleteRoute(deleteEmptyUnitCardsContract, logger, {
    handler: () => unitCardUseCases.deleteEmptyUnitCards(),
  }),
  implementPostRoute(createUnitCardVersionContract, logger, {
    handler: (request) => unitCardUseCases.createUnitCardVersion(request.body),
  }),
  implementPostRoute(updateUnitCardCertificationsContract, logger, {
    handler: () => unitCardUseCases.updateUnitCardCertifications(),
  }),
  implementMediaPostRoute(previewUnitCardContract, logger, {
    handler: (request) => unitCardUseCases.previewUnitCard(request.body),
  }),
];

export { createUnitCardRoutes };
