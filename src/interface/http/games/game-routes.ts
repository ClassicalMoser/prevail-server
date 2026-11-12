import {
  createBotVsBotGameContract,
  createVsBotGameContract,
} from '@classicalmoser/prevail-contracts';
import type {
  GameSessionUseCasesPort,
  LoggerPort,
  RouteRegistry,
} from '@ports';
import { implementPostRoute, withSubject } from '../route-definitions';

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
  // The subject becomes the human seat's owner: only that subject may open
  // that seat's socket.
  implementPostRoute(createVsBotGameContract, logger, {
    handler: withSubject(async (subject, request) =>
      gameSessionUseCases.createVsBotGame(subject, request.body),
    ),
  }),
  // The subject is the creator, the only one who may watch and step the game.
  implementPostRoute(createBotVsBotGameContract, logger, {
    handler: withSubject(async (subject, request) =>
      gameSessionUseCases.createBotVsBotGame(subject, request.body),
    ),
  }),
];

export { createGameRoutes };
