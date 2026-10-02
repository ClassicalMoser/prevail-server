import assert from 'node:assert/strict';
import { getOwnedArmiesContract } from '@classicalmoser/prevail-contracts/contracts';
import type {
  LoggerPort,
  OwnedArmyUseCasesPort,
  WireRouteRequest,
} from '@ports';
import { createOwnedArmyRoutes } from './owned-army-routes';

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

const useCases = (): OwnedArmyUseCasesPort =>
  ({
    getOwnedArmies: async (subject: string) => ({
      data: [{ id: subject }],
      success: true,
    }),
  }) as OwnedArmyUseCasesPort; // partial double; this suite only hits getOwnedArmies

describe('createOwnedArmyRoutes function', () => {
  it(
    'rejects an unauthenticated list request with missingAuth',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const routes = createOwnedArmyRoutes(useCases(), logger);
      const list = routes.find(
        (route) => route.path === getOwnedArmiesContract.path,
      );
      assert.ok(list !== undefined);

      const result = await list.invoke({
        body: undefined,
        headers: {},
        params: {},
        query: {},
      } satisfies WireRouteRequest);

      expect(routes).toHaveLength(5);
      expect(result).toStrictEqual({
        message: 'Unauthorized',
        status: 401,
        success: false,
      });
    },
  );

  it(
    'passes the authenticated subject into getOwnedArmies',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const routes = createOwnedArmyRoutes(useCases(), logger);
      const list = routes.find(
        (route) => route.path === getOwnedArmiesContract.path,
      );
      assert.ok(list !== undefined);

      const result = await list.invoke({
        auth: { subject: 'auth0|owner' },
        body: undefined,
        headers: {},
        params: {},
        query: {},
      } satisfies WireRouteRequest);

      expect(result).toStrictEqual({
        data: [{ id: 'auth0|owner' }],
        success: true,
      });
    },
  );
});
