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
  withSubject,
} from '../route-definitions';

/**
 * HTTP routes for owned armies.
 *
 * Every route requires an authenticated subject. The subject is the owner
 * key; handlers do not read a user id from the path. Create and archive use
 * the contract success status. Update sends the body through the use case,
 * which stores the name that arrived with the army.
 *
 * @param ownedArmyUseCases - Army use cases.
 * @param logger - Passed into the route helpers for unexpected failures.
 * @returns The owned-army route registry.
 */
const createOwnedArmyRoutes = (
  ownedArmyUseCases: OwnedArmyUseCasesPort,
  logger: LoggerPort,
): RouteRegistry => [
  // A player lists only their own armies; the subject is the owner key.
  implementGetRoute(getOwnedArmiesContract, logger, {
    handler: withSubject(async (subject, _request) =>
      ownedArmyUseCases.getOwnedArmies(subject),
    ),
  }),
  // The path id picks the army and the subject says whose; storage scopes both,
  // so another player's id answers like a missing one.
  implementGetRoute(getOwnedArmyByIdContract, logger, {
    handler: withSubject(async (subject, request) =>
      ownedArmyUseCases.getOwnedArmyById(subject, request.params.id),
    ),
  }),
  // Creates an empty army for the subject; the client fills it with PUT and
  // reads it back with GET, since create answers only the new id.
  implementPostRoute(createOwnedArmyContract, logger, {
    handler: withSubject(async (subject, _request) =>
      ownedArmyUseCases.createOwnedArmy(subject),
    ),
  }),
  // Saves the army builder's list under the subject's army; the body carries
  // the name and composition, never the army id or owner.
  implementPutRoute(updateOwnedArmyContract, logger, {
    handler: withSubject(async (subject, request) =>
      ownedArmyUseCases.updateOwnedArmy(
        subject,
        request.params.id,
        request.body,
      ),
    ),
  }),
  // Archive hides the army from the player without deleting its history.
  implementDeleteRoute(archiveOwnedArmyContract, logger, {
    handler: withSubject(async (subject, request) =>
      ownedArmyUseCases.archiveOwnedArmy(subject, request.params.id),
    ),
  }),
];

export { createOwnedArmyRoutes };
