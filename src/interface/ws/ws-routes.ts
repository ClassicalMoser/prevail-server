import type {
  GameSessionUseCasesPort,
  LoggerPort,
  WsRouteRegistry,
} from '@ports';
import { createGameWsRoutes } from './games';

/**
 * Assemble every WebSocket route registry for the process.
 *
 * @param gameSessionUseCases - Live game session use cases.
 * @param logger - Logger passed into seat route implementers.
 * @returns Flat WS registry registered by composition.
 */
const createWsRoutes = (
  gameSessionUseCases: GameSessionUseCasesPort,
  logger: LoggerPort,
): WsRouteRegistry => [...createGameWsRoutes(gameSessionUseCases, logger)];

export { createWsRoutes };
