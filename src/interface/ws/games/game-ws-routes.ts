import {
  blackInGameWsContract,
  botVsBotInGameWsContract,
  whiteInGameWsContract,
} from '@classicalmoser/prevail-contracts';
import type {
  GameSessionUseCasesPort,
  LoggerPort,
  WsRouteRegistry,
} from '@ports';
import { implementInGameBotVsBotWs } from '../implement-in-game-bot-vs-bot-ws';
import { implementInGameSeatWs } from '../implement-in-game-seat-ws';
import { createSeatHandlers } from './create-seat-handlers';
import { createWatchHandlers } from './create-watch-handlers';

/**
 * WebSocket routes for a live game: the white and black seats, and the
 * socket that watches and steps a bot-vs-bot game.
 *
 * @param gameSessionUseCases - Game session use cases for seat lifecycle.
 * @param logger - Passed into the seat implementers for unexpected failures.
 * @returns The game WS route registry.
 */
const createGameWsRoutes = (
  gameSessionUseCases: GameSessionUseCasesPort,
  logger: LoggerPort,
): WsRouteRegistry => [
  implementInGameSeatWs(
    whiteInGameWsContract,
    logger,
    createSeatHandlers('white', gameSessionUseCases),
  ),
  implementInGameSeatWs(
    blackInGameWsContract,
    logger,
    createSeatHandlers('black', gameSessionUseCases),
  ),
  implementInGameBotVsBotWs(
    botVsBotInGameWsContract,
    logger,
    createWatchHandlers(gameSessionUseCases),
  ),
];

export { createGameWsRoutes };
