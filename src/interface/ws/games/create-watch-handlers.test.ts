import type { GameSessionUseCasesPort } from '@ports';
import { watcher } from '@testing';
import { createWatchHandlers } from './create-watch-handlers';

// A watcher's connection to game-1, with no side because a watcher holds no
// seat.
const context = {
  auth: { subject: 'auth0|human' },
  headers: {},
  params: { gameId: 'game-1' },
};

describe('createWatchHandlers function', () => {
  it(
    'turns a refused step into its stepRejected payload',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const useCases: Pick<GameSessionUseCasesPort, 'stepBotVsBotGame'> = {
        // The use case refuses the step: the game is already over.
        stepBotVsBotGame: async () => ({
          message: 'The game is over',
          status: 409,
          success: false,
        }),
      };
      const handlers = createWatchHandlers(
        useCases as GameSessionUseCasesPort, // only the step use case is called here
      );

      // A watcher asks to step the bot game.
      const answered = await handlers.onStep(
        context,
        watcher('game-1').connection,
      );

      // The refusal is sent back as the stepRejected payload.
      expect(answered).toStrictEqual({
        ok: false,
        stepRejected: { errorReason: 'The game is over', result: false },
      });
    },
  );

  it('refuses to open when registration fails', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const useCases: Pick<GameSessionUseCasesPort, 'registerWatchConnection'> = {
      // The use case refuses the watcher, as when the game is not assigned to
      // this player.
      registerWatchConnection: async () => ({
        message: 'Game not assigned to this player',
        status: 403,
        success: false,
      }),
    };
    const handlers = createWatchHandlers(
      useCases as GameSessionUseCasesPort, // only the register use case is called here
    );

    const opened = await handlers.onOpen(context, vi.fn());

    // The refusal's message becomes the close reason.
    expect(opened).toStrictEqual({
      ok: false,
      reason: 'Game not assigned to this player',
    });
  });
});
