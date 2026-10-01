import {
  archiveOwnedArmyContract,
  createOwnedArmyContract,
  getOwnedArmiesContract,
  getOwnedArmyByIdContract,
  updateOwnedArmyContract,
} from '@classicalmoser/prevail-contracts/contracts';
import type { LoggerPort, OwnedArmyUseCasesPort, RouteRegistry } from '@ports';
import {
  implementDeleteRoute,
  implementGetRoute,
  implementPostRoute,
  implementPutRoute,
  missingAuth,
  requireSubject,
} from '../route-definitions';

/**
 * HTTP routes for owned armies.
 *
 * Every route requires an authenticated subject. The subject is the owner
 * key; handlers do not read a user id from the path. Create and archive use
 * the contract success status. Update sends the body through the use case,
 * which derives the display name.
 *
 * @param ownedArmyUseCases - Army use cases.
 * @param logger - Passed into the route helpers for unexpected failures.
 * @returns The owned-army route registry.
 */
const createOwnedArmyRoutes = (
  ownedArmyUseCases: OwnedArmyUseCasesPort,
  logger: LoggerPort,
): RouteRegistry => [
  implementGetRoute(getOwnedArmiesContract, logger, {
    handler: async (_request, auth) => {
      const subject = requireSubject(auth);
      if (subject === undefined) {
        return missingAuth;
      }
      return ownedArmyUseCases.getOwnedArmies(subject);
    },
  }),
  implementGetRoute(getOwnedArmyByIdContract, logger, {
    handler: async (request, auth) => {
      const subject = requireSubject(auth);
      if (subject === undefined) {
        return missingAuth;
      }
      return ownedArmyUseCases.getOwnedArmyById(subject, request.params.id);
    },
  }),
  implementPostRoute(createOwnedArmyContract, logger, {
    handler: async (_request, auth) => {
      const subject = requireSubject(auth);
      if (subject === undefined) {
        return missingAuth;
      }
      return ownedArmyUseCases.createOwnedArmy(subject);
    },
  }),
  implementPutRoute(updateOwnedArmyContract, logger, {
    handler: async (request, auth) => {
      const subject = requireSubject(auth);
      if (subject === undefined) {
        return missingAuth;
      }
      return ownedArmyUseCases.updateOwnedArmy(
        subject,
        request.params.id,
        request.body,
      );
    },
  }),
  implementDeleteRoute(archiveOwnedArmyContract, logger, {
    handler: async (request, auth) => {
      const subject = requireSubject(auth);
      if (subject === undefined) {
        return missingAuth;
      }
      return ownedArmyUseCases.archiveOwnedArmy(subject, request.params.id);
    },
  }),
];

export { createOwnedArmyRoutes };
