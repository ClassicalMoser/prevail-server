import type {
  GameSessionUseCasesPort,
  LoggerPort,
  WsRouteRegistry,
} from '@ports';
import { createGameWsRoutes } from './game-ws-routes';

const logger: LoggerPort = {
  error: (): void => {
    /* unused */
  },
  info: (): void => {
    /* unused */
  },
  warn: (): void => {
    /* unused */
  },
};

const useCases = (): GameSessionUseCasesPort => ({}) as GameSessionUseCasesPort; // route factory only wires handlers; not invoked here

describe('createGameWsRoutes function', () => {
  it(
    'builds the white seat, black seat, and bot-vs-bot routes',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const routes: WsRouteRegistry = createGameWsRoutes(useCases(), logger);

      expect(routes.map((route) => route.path)).toStrictEqual([
        '/ws/games/id/:gameId/white',
        '/ws/games/id/:gameId/black',
        '/ws/games/id/:gameId/bot-vs-bot',
      ]);
    },
  );
});
