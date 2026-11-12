import { createEmptyCommandCardContract } from '@classicalmoser/prevail-contracts/contracts';
import type { WireRouteRequest } from '@ports';
import { recordingLogger } from '@testing';
import { implementPostRoute } from './implement-post-route';

const logger = recordingLogger();

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

      const route = implementPostRoute(createEmptyCommandCardContract, logger, {
        handler: async () => ({
          data: '550e8400-e29b-41d4-a716-446655440099',
          success: true,
        }),
      });

      const result = await route.invoke(wire());

      expect(route).toMatchObject({
        method: 'POST',
        path: createEmptyCommandCardContract.path,
        successStatus: createEmptyCommandCardContract.successStatus,
      });
      expect(result).toStrictEqual({
        data: '550e8400-e29b-41d4-a716-446655440099',
        success: true,
      });
    },
  );
});
