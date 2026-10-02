import assert from 'node:assert/strict';
import type {
  GameSessionUseCasesPort,
  LoggerPort,
  WireRouteRequest,
} from '@ports';
import { createGameRoutes } from './game-routes';

const logger: LoggerPort = {
  error: (): void => {
    /* unused */
  },
  info: (): void => {
    /* unused */
  },
  warn: (): void => {
    /* unused */
  },
};

const useCases = (): GameSessionUseCasesPort =>
  ({
    createVsBotGame: async (subject, body) => ({
      data: `${subject}:${body.gameMode}`,
      success: true,
    }),
  }) as GameSessionUseCasesPort; // partial double; this suite only hits createVsBotGame

const createBody = {
  blackArmyId: '550e8400-e29b-41d4-a716-446655440002',
  gameMode: 'mini' as const,
  humanSide: 'white' as const,
  whiteArmyId: '550e8400-e29b-41d4-a716-446655440001',
};

describe('createGameRoutes function', () => {
  it('rejects create when auth is missing', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const [route] = createGameRoutes(useCases(), logger);
    assert.ok(route !== undefined);

    const result = await route.invoke({
      body: createBody,
      headers: {},
      params: {},
      query: {},
    } satisfies WireRouteRequest);

    expect(result).toStrictEqual({
      message: 'Unauthorized',
      status: 401,
      success: false,
    });
  });

  it(
    'creates a vs-bot game for the authenticated subject',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const [route] = createGameRoutes(useCases(), logger);
      assert.ok(route !== undefined);

      const result = await route.invoke({
        auth: { subject: 'auth0|human' },
        body: createBody,
        headers: {},
        params: {},
        query: {},
      } satisfies WireRouteRequest);

      expect(result).toStrictEqual({
        data: 'auth0|human:mini',
        success: true,
      });
    },
  );
});
