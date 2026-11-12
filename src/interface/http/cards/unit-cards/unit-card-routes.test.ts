import assert from 'node:assert/strict';
import { getCurrentUnitCardsContract } from '@classicalmoser/prevail-contracts/contracts';
import type { UnitCardUseCasesPort, WireRouteRequest } from '@ports';
import { createUnitCardRoutes } from './unit-card-routes';
import { recordingLogger } from '@testing';

const logger = recordingLogger();

// A partial use-case double: only getCurrentUnitCards exists.
const useCases = (): UnitCardUseCasesPort =>
  ({
    getCurrentUnitCards: async () => ({
      data: [{ id: 'current-unit' }],
      success: true,
    }),
  }) as UnitCardUseCasesPort; // partial double; this suite only hits getCurrent

describe('createUnitCardRoutes function', () => {
  it(
    'registers nine unit-card routes and wires the current-list GET',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const routes = createUnitCardRoutes(useCases(), logger);
      // Find the current-cards route by the contract's path rather than by
      // position.
      const current = routes.find(
        (route) => route.path === getCurrentUnitCardsContract.path,
      );
      assert.ok(current !== undefined);

      const result = await current.invoke({
        body: undefined,
        headers: {},
        params: {},
        query: {},
      } satisfies WireRouteRequest);

      // The unit-card API has nine routes in all.
      expect(routes).toHaveLength(9);
      // The route returns what the use case returned, which shows it is wired
      // to the right method.
      expect(result).toStrictEqual({
        data: [{ id: 'current-unit' }],
        success: true,
      });
    },
  );
});
