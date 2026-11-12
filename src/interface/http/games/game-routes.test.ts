import assert from 'node:assert/strict';
import type { GameSessionUseCasesPort, WireRouteRequest } from '@ports';
import { createGameRoutes } from './game-routes';
import { recordingLogger } from '@testing';

const logger = recordingLogger();

// A partial use-case double: only createVsBotGame exists, and it echoes the
// subject and mode.
const useCases = (): GameSessionUseCasesPort =>
  ({
    createVsBotGame: async (subject, body) => ({
      data: `${subject}:${body.gameMode}`,
      success: true,
    }),
  }) as GameSessionUseCasesPort; // partial double; this suite only hits createVsBotGame

// A request to start a mini game against a bot, the human playing white, with
// two army ids.
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

    // A request with no auth field, as when no token was sent.
    const result = await route.invoke({
      body: createBody,
      headers: {},
      params: {},
      query: {},
    } satisfies WireRouteRequest);

    // The route answers 401 and the game is not created.
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
        // The caller is authenticated as auth0|human.
        auth: { subject: 'auth0|human' },
        body: createBody,
        headers: {},
        params: {},
        query: {},
      } satisfies WireRouteRequest);

      // The id the echo returns shows the use case got the authenticated
      // subject and the body's mode.
      expect(result).toStrictEqual({
        data: 'auth0|human:mini',
        success: true,
      });
    },
  );
});
