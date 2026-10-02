import type {
  GameSessionUseCasesPort,
  LoggerPort,
  WsRouteRegistry,
} from '@ports';
import { createWsRoutes } from './ws-routes';

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

describe('createWsRoutes function', () => {
  it(
    'registers the white and black in-game seat routes',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const routes: WsRouteRegistry = createWsRoutes(useCases(), logger);

      expect(routes).toHaveLength(2);
      expect(routes.map((route) => route.side)).toStrictEqual([
        'white',
        'black',
      ]);
    },
  );
});
