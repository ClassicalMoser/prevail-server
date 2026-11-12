import { createEmptyCommandCardContract } from '@classicalmoser/prevail-contracts/contracts';
import type { WireRouteRequest } from '@ports';
import { recordingLogger } from '@testing';
import { implementPostRoute } from './implement-post-route';

const logger = recordingLogger();

// An empty request off the wire; each case overrides only the part it checks.
const wire = (overrides: Partial<WireRouteRequest> = {}): WireRouteRequest => ({
  body: {},
  headers: {},
  params: {},
  query: {},
  ...overrides,
});

describe('implementPostRoute function', () => {
  it(
    'registers the contract success status and returns handler data',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The create-empty command card contract, with a handler that returns a
      // new card id.
      const route = implementPostRoute(createEmptyCommandCardContract, logger, {
        handler: async () => ({
          data: '550e8400-e29b-41d4-a716-446655440099',
          success: true,
        }),
      });

      const result = await route.invoke(wire());

      // The route takes its success status from the contract, so the create
      // route answers the status the client expects.
      expect(route).toMatchObject({
        method: 'POST',
        path: createEmptyCommandCardContract.path,
        successStatus: createEmptyCommandCardContract.successStatus,
      });
      // The handler's id passes through.
      expect(result).toStrictEqual({
        data: '550e8400-e29b-41d4-a716-446655440099',
        success: true,
      });
    },
  );
});
