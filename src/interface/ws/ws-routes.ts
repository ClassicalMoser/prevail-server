import type {
  GameSessionUseCasesPort,
  LoggerPort,
  WsRouteRegistry,
} from '@ports';
import { createGameWsRoutes } from './games';

const createWsRoutes = (
  gameSessionUseCases: GameSessionUseCasesPort,
  logger: LoggerPort,
): WsRouteRegistry => [...createGameWsRoutes(gameSessionUseCases, logger)];

export { createWsRoutes };
