import {
  createBotVsBotGameContract,
  createVsBotGameContract,
  getBotVsBotGameContract,
  stepBotVsBotGameContract,
} from '@classicalmoser/prevail-contracts';
import type {
  GameSessionUseCasesPort,
  LoggerPort,
  RouteRegistry,
} from '@ports';
import {
  implementGetRoute,
  implementPostRoute,
  missingAuth,
  requireSubject,
} from '../route-definitions';

/**
 * HTTP routes for live game sessions.
 *
 * Vs-bot returns a game id and continues on a seat socket. Bot-vs-bot
 * returns the authoritative game and advances one choice per step.
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
  implementPostRoute(createBotVsBotGameContract, logger, {
    handler: async (request, auth) => {
      const subject = requireSubject(auth);
      if (subject === undefined) {
        return missingAuth;
      }
      return gameSessionUseCases.createBotVsBotGame(subject, request.body);
    },
  }),
  implementGetRoute(getBotVsBotGameContract, logger, {
    handler: async (request, auth) => {
      const subject = requireSubject(auth);
      if (subject === undefined) {
        return missingAuth;
      }
      return gameSessionUseCases.getBotVsBotGame(
        subject,
        request.params.gameId,
      );
    },
  }),
  implementPostRoute(stepBotVsBotGameContract, logger, {
    handler: async (request, auth) => {
      const subject = requireSubject(auth);
      if (subject === undefined) {
        return missingAuth;
      }
      return gameSessionUseCases.stepBotVsBotGame(
        subject,
        request.params.gameId,
      );
    },
  }),
];

export { createGameRoutes };
