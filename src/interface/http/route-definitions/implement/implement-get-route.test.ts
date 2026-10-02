import { getCommandCardByIdContract } from '@classicalmoser/prevail-contracts/contracts';
import type { LoggerPort, WireRouteRequest } from '@ports';
import { implementGetRoute } from './implement-get-route';

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

const wire = (overrides: Partial<WireRouteRequest> = {}): WireRouteRequest => ({
  body: undefined,
  headers: {},
  params: {},
  query: {},
  ...overrides,
});

describe('implementGetRoute function', () => {
  it(
    'returns invalidParams when the contract params fail',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const route = implementGetRoute(getCommandCardByIdContract, logger, {
        handler: async () => ({ data: null, success: true }),
      });

      const result = await route.invoke(wire());

      expect(result).toStrictEqual({
        message: 'Invalid params',
        status: 400,
        success: false,
      });
    },
  );

  it(
    'invokes the handler with parsed params for a valid request',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const cardId = '550e8400-e29b-41d4-a716-446655440001';
      const route = implementGetRoute(getCommandCardByIdContract, logger, {
        handler: async (request) => ({
          data: { id: request.params.id },
          success: true,
        }),
      });

      const result = await route.invoke(wire({ params: { id: cardId } }));

      expect(route).toMatchObject({
        method: 'GET',
        path: getCommandCardByIdContract.path,
        successStatus: 200,
      });
      expect(result).toStrictEqual({
        data: { id: cardId },
        success: true,
      });
    },
  );

  it(
    'turns a thrown handler error into a 500 envelope',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const cardId = '550e8400-e29b-41d4-a716-446655440001';
      const route = implementGetRoute(getCommandCardByIdContract, logger, {
        handler: async () => {
          throw new Error('boom');
        },
      });

      const result = await route.invoke(wire({ params: { id: cardId } }));

      expect(result).toStrictEqual({
        message: `Failed to handle GET on ${getCommandCardByIdContract.path}`,
        status: 500,
        success: false,
      });
    },
  );
});
