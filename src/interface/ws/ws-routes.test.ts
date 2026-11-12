import type { GameSessionUseCasesPort, WsRouteRegistry } from '@ports';
import { createWsRoutes } from './ws-routes';
import { recordingLogger } from '@testing';

const logger = recordingLogger();

const useCases = (): GameSessionUseCasesPort => ({}) as GameSessionUseCasesPort; // route factory only wires handlers; not invoked here

describe('createWsRoutes function', () => {
  it(
    'registers the seat routes and the bot-vs-bot route',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const routes: WsRouteRegistry = createWsRoutes(useCases(), logger);

      expect(routes.map((route) => route.path)).toStrictEqual([
        '/ws/games/id/:gameId/white',
        '/ws/games/id/:gameId/black',
        '/ws/games/id/:gameId/bot-vs-bot',
      ]);
    },
  );
});
