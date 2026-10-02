import type { MediaPostRoute } from '@classicalmoser/prevail-contracts';
import type { LoggerPort, WireRouteRequest } from '@ports';
import { implementMediaPostRoute } from './implement-media-post-route';

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
  method: 'POST',
  path: '/media-stub',
  successContentType: 'image/svg+xml',
  validators: {
    body: { safeParse: (value: unknown) => pass(value) },
    params: { safeParse: () => pass({}) },
    query: { safeParse: () => pass({}) },
  },
} as unknown as MediaPostRoute<
  Record<string, never>,
  Record<string, never>,
  unknown,
  'image/svg+xml'
>; // stub safeParse doubles; ZodType is too large to fake fully

const wire = (overrides: Partial<WireRouteRequest> = {}): WireRouteRequest => ({
  body: { any: 'card' },
  headers: {},
  params: {},
  query: {},
  ...overrides,
});

describe('implementMediaPostRoute function', () => {
  it(
    'keeps the contract media content type and returns handler bytes',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const svg = '<svg />';
      const route = implementMediaPostRoute(stubContract, logger, {
        handler: async () => ({
          data: svg,
          success: true,
        }),
      });

      const result = await route.invoke(wire());

      expect(route).toMatchObject({
        method: 'POST',
        path: '/media-stub',
        successContentType: 'image/svg+xml',
        successStatus: 200,
      });
      expect(result).toStrictEqual({ data: svg, success: true });
    },
  );
});
