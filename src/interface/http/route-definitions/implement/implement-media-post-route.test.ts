import type { MediaPostRoute } from '@classicalmoser/prevail-contracts';
import type { WireRouteRequest } from '@ports';
import { recordingLogger } from '@testing';
import { implementMediaPostRoute } from './implement-media-post-route';

const logger = recordingLogger();

// Builds a successful parse outcome around the given value.
const pass = <T>(data: T): { success: true; data: T } => ({
  success: true,
  data,
});

// A stub contract: validators that accept anything, and an SVG success type.
// Only the content type and the handler matter here.
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

// An empty request off the wire; each case overrides only the part it checks.
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

      // A rendered card image as text.
      const svg = '<svg />';
      const route = implementMediaPostRoute(stubContract, logger, {
        handler: async () => ({
          data: svg,
          success: true,
        }),
      });

      const result = await route.invoke(wire());

      // The route keeps the contract's SVG content type, so the client receives
      // an image rather than JSON.
      expect(route).toMatchObject({
        method: 'POST',
        path: '/media-stub',
        successContentType: 'image/svg+xml',
        successStatus: 200,
      });
      // The handler's image text is returned as is.
      expect(result).toStrictEqual({ data: svg, success: true });
    },
  );
});
