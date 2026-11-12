import type { GameSessionUseCasesPort, WsRouteRegistry } from '@ports';
import { createGameWsRoutes } from './game-ws-routes';
import { recordingLogger } from '@testing';

const logger = recordingLogger();

// The route factory only wires handlers to use cases; nothing is called here,
// so an empty object is enough.
const useCases = (): GameSessionUseCasesPort => ({}) as GameSessionUseCasesPort; // route factory only wires handlers; not invoked here

describe('createGameWsRoutes function', () => {
  it(
    'builds the white seat, black seat, and bot-vs-bot routes',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const routes: WsRouteRegistry = createGameWsRoutes(useCases(), logger);

      // Both seats and the bot-vs-bot watch route are registered under the game
      // id path.
      expect(routes.map((route) => route.path)).toStrictEqual([
        '/ws/games/id/:gameId/white',
        '/ws/games/id/:gameId/black',
        '/ws/games/id/:gameId/bot-vs-bot',
      ]);
    },
  );
});
