import assert from 'node:assert/strict';
import { getCurrentCommandCardsContract } from '@classicalmoser/prevail-contracts/contracts';
import type {
  CommandCardUseCasesPort,
  LoggerPort,
  WireRouteRequest,
} from '@ports';
import { createCommandCardRoutes } from './command-card-routes';

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

const useCases = (): CommandCardUseCasesPort =>
  ({
    getCurrentCommandCards: async () => ({
      data: [{ id: 'current' }],
      success: true,
    }),
  }) as CommandCardUseCasesPort; // partial double; this suite only hits getCurrent

describe('createCommandCardRoutes function', () => {
  it(
    'registers nine command-card routes and wires the current-list GET',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const routes = createCommandCardRoutes(useCases(), logger);
      const current = routes.find(
        (route) => route.path === getCurrentCommandCardsContract.path,
      );
      assert.ok(current !== undefined);

      const result = await current.invoke({
        body: undefined,
        headers: {},
        params: {},
        query: {},
      } satisfies WireRouteRequest);

      expect(routes).toHaveLength(9);
      expect(result).toStrictEqual({
        data: [{ id: 'current' }],
        success: true,
      });
    },
  );
});
