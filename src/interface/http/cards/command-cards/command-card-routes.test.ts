import assert from 'node:assert/strict';
import { getCurrentCommandCardsContract } from '@classicalmoser/prevail-contracts/contracts';
import type { CommandCardUseCasesPort, WireRouteRequest } from '@ports';
import { createCommandCardRoutes } from './command-card-routes';
import { recordingLogger } from '@testing';

const logger = recordingLogger();

// A partial use-case double: only getCurrentCommandCards exists.
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
      // Find the current-cards route by the contract's path rather than by
      // position.
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

      // The command-card API has nine routes in all.
      expect(routes).toHaveLength(9);
      // The route returns what the use case returned, which shows it is wired
      // to the right method.
      expect(result).toStrictEqual({
        data: [{ id: 'current' }],
        success: true,
      });
    },
  );
});
