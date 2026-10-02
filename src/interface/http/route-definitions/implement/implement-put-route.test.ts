import { updateOwnedArmyContract } from '@classicalmoser/prevail-contracts/contracts';
import type { LoggerPort, WireRouteRequest } from '@ports';
import { implementPutRoute } from './implement-put-route';

const logger: LoggerPort = {
  error: (): void => {
    /* unexpected handler failures; this suite asserts the envelope */
  },
  info: (): void => {
    /* unused */
  },
  warn: (): void => {
    /* unused */
  },
};

const armyId = '550e8400-e29b-41d4-a716-446655440001';

const body = {
  armyName: 'Legion',
  commandCards: [],
  units: [],
};

const wire = (overrides: Partial<WireRouteRequest> = {}): WireRouteRequest => ({
  body,
  headers: {},
  params: { id: armyId },
  query: {},
  ...overrides,
});

describe('implementPutRoute function', () => {
  it(
    'registers a PUT route and returns the handler result',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const route = implementPutRoute(updateOwnedArmyContract, logger, {
        handler: async () => ({
          data: {},
          success: true,
        }),
      });

      const result = await route.invoke(wire());

      expect(route).toMatchObject({
        method: 'PUT',
        path: updateOwnedArmyContract.path,
        successStatus: 200,
      });
      expect(result).toStrictEqual({ data: {}, success: true });
    },
  );
});
