import assert from 'node:assert/strict';
import { getOwnedArmiesContract } from '@classicalmoser/prevail-contracts/contracts';
import type { OwnedArmyUseCasesPort, WireRouteRequest } from '@ports';
import { createOwnedArmyRoutes } from './owned-army-routes';
import { recordingLogger } from '@testing';

const logger = recordingLogger();

// A partial use-case double: only getOwnedArmies exists, and it echoes the
// subject so a test sees who was asked for.
const useCases = (): OwnedArmyUseCasesPort =>
  ({
    getOwnedArmies: async (subject: string) => ({
      data: [{ id: subject }],
      success: true,
    }),
  }) as OwnedArmyUseCasesPort; // partial double; this suite only hits getOwnedArmies

describe('createOwnedArmyRoutes function', () => {
  it(
    'registers one route for each owned-army operation',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // List, get by id, create, update, archive.
      const routes = createOwnedArmyRoutes(useCases(), logger);

      expect(routes).toHaveLength(5);
    },
  );

  it(
    'rejects an unauthenticated list request with missingAuth',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const routes = createOwnedArmyRoutes(useCases(), logger);
      // Find the list route by the contract's path rather than by position.
      const list = routes.find(
        (route) => route.path === getOwnedArmiesContract.path,
      );
      assert.ok(list !== undefined);

      const result = await list.invoke({
        // A request with no auth field, as when no token was sent.
        body: undefined,
        headers: {},
        params: {},
        query: {},
      } satisfies WireRouteRequest);

      // The route answers 401 itself, before it would call the use case.
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
        // The caller is authenticated as auth0|owner.
        auth: { subject: 'auth0|owner' },
        body: undefined,
        headers: {},
        params: {},
        query: {},
      } satisfies WireRouteRequest);

      // The use case was asked for the caller's own armies: its echo of the
      // subject proves which subject was passed.
      expect(result).toStrictEqual({
        data: [{ id: 'auth0|owner' }],
        success: true,
      });
    },
  );
});
