import {
  createBotVsBotGameContract,
  createVsBotGameContract,
} from '@classicalmoser/prevail-contracts';
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
 * HTTP routes for live game sessions.
 *
 * Both return a game id. Vs-bot continues on a seat socket; bot-vs-bot
 * continues on the bot-vs-bot socket, which watches and steps the game.
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
];

export { createGameRoutes };
