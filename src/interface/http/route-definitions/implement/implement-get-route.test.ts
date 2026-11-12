import { getCommandCardByIdContract } from '@classicalmoser/prevail-contracts/contracts';
import type { WireRouteRequest } from '@ports';
import { recordingLogger } from '@testing';
import { implementGetRoute } from './implement-get-route';

const logger = recordingLogger();

// An empty request off the wire; each case overrides only the part it checks.
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

      // The handler is never reached: this request carries no id, which the
      // contract requires.
      const route = implementGetRoute(getCommandCardByIdContract, logger, {
        handler: async () => ({ data: null, success: true }),
      });

      const result = await route.invoke(wire());

      // A request that fails the contract is answered 400 before the handler
      // runs.
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

      // A uuid-shaped command card id.
      const cardId = '550e8400-e29b-41d4-a716-446655440001';
      // The handler echoes the parsed id, to show it got the validated params.
      const route = implementGetRoute(getCommandCardByIdContract, logger, {
        handler: async (request) => ({
          data: { id: request.params.id },
          success: true,
        }),
      });

      const result = await route.invoke(wire({ params: { id: cardId } }));

      // The route is a GET at the contract's path answering 200.
      expect(route).toMatchObject({
        method: 'GET',
        path: getCommandCardByIdContract.path,
        successStatus: 200,
      });
      // The handler saw the id from the request.
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

      // A uuid-shaped command card id.
      const cardId = '550e8400-e29b-41d4-a716-446655440001';
      const route = implementGetRoute(getCommandCardByIdContract, logger, {
        handler: async () => {
          // A handler that throws must not crash the server.
          throw new Error('boom');
        },
      });

      const result = await route.invoke(wire({ params: { id: cardId } }));

      // The thrown error becomes a generic 500 naming the method and path,
      // without the error text.
      expect(result).toStrictEqual({
        message: `Failed to handle GET on ${getCommandCardByIdContract.path}`,
        status: 500,
        success: false,
      });
    },
  );
});
