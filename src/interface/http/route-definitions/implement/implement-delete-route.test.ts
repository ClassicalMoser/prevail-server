import { deleteEmptyCommandCardsContract } from '@classicalmoser/prevail-contracts/contracts';
import type { WireRouteRequest } from '@ports';
import { recordingLogger } from '@testing';
import { implementDeleteRoute } from './implement-delete-route';

const logger = recordingLogger();

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

      const route = implementDeleteRoute(
        deleteEmptyCommandCardsContract,
        logger,
        {
          handler: async () => ({ success: true }),
        },
      );

      const result = await route.invoke(wire());

      expect(route).toMatchObject({
        method: 'DELETE',
        path: deleteEmptyCommandCardsContract.path,
        successStatus: 204,
      });
      expect(result).toStrictEqual({ success: true });
    },
  );
});
