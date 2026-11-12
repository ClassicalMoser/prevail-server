import { deleteEmptyCommandCardsContract } from '@classicalmoser/prevail-contracts/contracts';
import type { WireRouteRequest } from '@ports';
import { recordingLogger } from '@testing';
import { implementDeleteRoute } from './implement-delete-route';

const logger = recordingLogger();

// An empty request off the wire; each case overrides only the part it checks.
const wire = (overrides: Partial<WireRouteRequest> = {}): WireRouteRequest => ({
  body: undefined,
  headers: {},
  params: {},
  query: {},
  ...overrides,
});

describe('implementDeleteRoute function', () => {
  it(
    'registers a 204 delete route and returns the handler result',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The real delete-empty command cards contract, with a handler that
      // succeeds with no data.
      const route = implementDeleteRoute(
        deleteEmptyCommandCardsContract,
        logger,
        {
          handler: async () => ({ success: true }),
        },
      );

      const result = await route.invoke(wire());

      // The route is a DELETE at the contract's path and answers 204, which a
      // browser expects for a delete with no body.
      expect(route).toMatchObject({
        method: 'DELETE',
        path: deleteEmptyCommandCardsContract.path,
        successStatus: 204,
      });
      // The handler's result passes through with no data field.
      expect(result).toStrictEqual({ success: true });
    },
  );
});
