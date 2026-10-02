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
  it('builds white then black seat WebSocket routes', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const routes: WsRouteRegistry = createGameWsRoutes(useCases(), logger);

    expect(routes).toHaveLength(2);
    expect(routes[0]?.side).toBe('white');
    expect(routes[1]?.side).toBe('black');
  });
});
