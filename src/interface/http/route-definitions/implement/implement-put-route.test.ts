import { updateOwnedArmyContract } from '@classicalmoser/prevail-contracts/contracts';
import type { WireRouteRequest } from '@ports';
import { recordingLogger } from '@testing';
import { implementPutRoute } from './implement-put-route';

const logger = recordingLogger();

// A uuid-shaped army id for the path.
const armyId = '550e8400-e29b-41d4-a716-446655440001';

// A valid army update body: a name and empty lists.
const body = {
  name: 'Legion',
  commandCards: [],
  units: [],
};

// An empty request off the wire; each case overrides only the part it checks.
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

      // The real update-owned-army contract, with a handler that succeeds with
      // an empty object.
      const route = implementPutRoute(updateOwnedArmyContract, logger, {
        handler: async () => ({
          data: {},
          success: true,
        }),
      });

      const result = await route.invoke(wire());

      // The route is a PUT at the contract's path answering 200.
      expect(route).toMatchObject({
        method: 'PUT',
        path: updateOwnedArmyContract.path,
        successStatus: 200,
      });
      // The handler's result passes through.
      expect(result).toStrictEqual({ data: {}, success: true });
    },
  );
});
