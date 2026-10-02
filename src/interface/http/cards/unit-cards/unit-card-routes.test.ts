import assert from 'node:assert/strict';
import { getCurrentUnitCardsContract } from '@classicalmoser/prevail-contracts/contracts';
import type {
  LoggerPort,
  UnitCardUseCasesPort,
  WireRouteRequest,
} from '@ports';
import { createUnitCardRoutes } from './unit-card-routes';

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

      expect(routes).toHaveLength(9);
      expect(result).toStrictEqual({
        data: [{ id: 'current-unit' }],
        success: true,
      });
    },
  );
});
