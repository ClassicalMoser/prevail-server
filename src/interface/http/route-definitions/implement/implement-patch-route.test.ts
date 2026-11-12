import type { PatchRoute } from '@classicalmoser/prevail-contracts';
import type { WireRouteRequest } from '@ports';
import { recordingLogger } from '@testing';
import { implementPatchRoute } from './implement-patch-route';

const logger = recordingLogger();

// Builds a successful parse outcome around the given value.
const pass = <T>(data: T): { success: true; data: T } => ({
  success: true,
  data,
});

// A stub contract, since no live PATCH contract exists yet; its validators
// accept the request and the response.
const stubContract = {
  auth: { authRequired: false },
  method: 'PATCH',
  path: '/stub',
  validators: {
    body: { safeParse: () => pass({ name: 'x' }) },
    data: { safeParse: (value: unknown) => pass(value) },
    params: { safeParse: () => pass({}) },
    query: { safeParse: () => pass({}) },
  },
} as unknown as PatchRoute<
  Record<string, never>,
  Record<string, never>,
  { name: string },
  { name: string }
>; // no live PATCH contract yet; stub only the safeParse surface

// An empty request off the wire; each case overrides only the part it checks.
const wire = (overrides: Partial<WireRouteRequest> = {}): WireRouteRequest => ({
  body: { name: 'x' },
  headers: {},
  params: {},
  query: {},
  ...overrides,
});

describe('implementPatchRoute function', () => {
  it(
    'registers a PATCH route and returns the handler result',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const route = implementPatchRoute(stubContract, logger, {
        // The handler echoes the parsed body, to show it received the validated
        // body.
        handler: async (request) => ({
          data: request.body,
          success: true,
        }),
      });

      const result = await route.invoke(wire());

      // The route is a PATCH at the stub's path answering 200.
      expect(route).toMatchObject({
        method: 'PATCH',
        path: '/stub',
        successStatus: 200,
      });
      // The handler's result passes through.
      expect(result).toStrictEqual({ data: { name: 'x' }, success: true });
    },
  );
});
