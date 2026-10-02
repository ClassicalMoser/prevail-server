import type { PatchRoute } from '@classicalmoser/prevail-contracts';
import type { LoggerPort, WireRouteRequest } from '@ports';
import { implementPatchRoute } from './implement-patch-route';

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

const pass = <T>(data: T): { success: true; data: T } => ({
  success: true,
  data,
});

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
        handler: async (request) => ({
          data: request.body,
          success: true,
        }),
      });

      const result = await route.invoke(wire());

      expect(route).toMatchObject({
        method: 'PATCH',
        path: '/stub',
        successStatus: 200,
      });
      expect(result).toStrictEqual({ data: { name: 'x' }, success: true });
    },
  );
});
