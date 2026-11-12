import type { GameSessionUseCasesPort } from '@ports';
import { watcher } from '@testing';
import { createWatchHandlers } from './create-watch-handlers';

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
        stepBotVsBotGame: async () => ({
          message: 'The game is over',
          status: 409,
          success: false,
        }),
      };
      const handlers = createWatchHandlers(
        useCases as GameSessionUseCasesPort, // only the step use case is called here
      );

      const answered = await handlers.onStep(
        context,
        watcher('game-1').connection,
      );

      expect(answered).toStrictEqual({
        ok: false,
        stepRejected: { errorReason: 'The game is over', result: false },
      });
    },
  );

  it('refuses to open when registration fails', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const useCases: Pick<GameSessionUseCasesPort, 'registerWatchConnection'> = {
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

    expect(opened).toStrictEqual({
      ok: false,
      reason: 'Game not assigned to this player',
    });
  });
});
