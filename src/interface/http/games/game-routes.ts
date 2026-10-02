import { createVsBotGameContract } from '@classicalmoser/prevail-contracts';
import type {
  GameSessionUseCasesPort,
  LoggerPort,
  RouteRegistry,
} from '@ports';
import {
  implementPostRoute,
  missingAuth,
  requireSubject,
} from '../route-definitions';

/**
 * HTTP routes for live game sessions (create vs bot today).
 *
 * @param gameSessionUseCases - Game session use cases.
 * @param logger - Passed into the route helpers for unexpected failures.
 * @returns The game route registry.
 */
const createGameRoutes = (
  gameSessionUseCases: GameSessionUseCasesPort,
  logger: LoggerPort,
): RouteRegistry => [
  implementPostRoute(createVsBotGameContract, logger, {
    handler: async (request, auth) => {
      const subject = requireSubject(auth);
      if (subject === undefined) {
        return missingAuth;
      }
      return gameSessionUseCases.createVsBotGame(subject, request.body);
    },
  }),
];

export { createGameRoutes };
