import type { PlayerChoiceEvent } from '@classicalmoser/prevail-rules/domain';
import type { GameSessionUseCasesPort } from '@ports';
import { seatConnection } from '@testing';
import { createSeatHandlers } from './create-seat-handlers';

const context = {
  auth: { subject: 'auth0|human' },
  headers: {},
  params: { gameId: 'game-1' },
  side: 'white' as const,
};

const choice = {
  choiceType: 'doneIssuingCommands',
  eventType: 'playerChoice',
  player: 'white',
} as PlayerChoiceEvent; // narrow fixture; the handler only forwards the choice

describe('createSeatHandlers function', () => {
  it('opens by registering the seat it owns', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const registered: unknown[] = [];
    const useCases: Pick<GameSessionUseCasesPort, 'registerSeatConnection'> = {
      registerSeatConnection: async (connection) => {
        registered.push([
          connection.gameId,
          connection.side,
          connection.subject,
        ]);
        return { data: undefined, success: true };
      },
    };
    const handlers = createSeatHandlers(
      'white',
      useCases as GameSessionUseCasesPort,
    ); // only registration is called here

    const opened = await handlers.onOpen(context, vi.fn());

    expect(opened).toMatchObject({ ok: true });
    expect(registered).toStrictEqual([['game-1', 'white', 'auth0|human']]);
  });

  it('refuses to open when registration fails', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const useCases: Pick<GameSessionUseCasesPort, 'registerSeatConnection'> = {
      registerSeatConnection: async () => ({
        message: 'Seat not assigned to this player',
        status: 403,
        success: false,
      }),
    };
    const handlers = createSeatHandlers(
      'white',
      useCases as GameSessionUseCasesPort,
    ); // only registration is called here

    await expect(handlers.onOpen(context, vi.fn())).resolves.toStrictEqual({
      ok: false,
      reason: 'Seat not assigned to this player',
    });
  });

  it(
    'submits a choice for its own side and subject',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const submitted: unknown[] = [];
      const useCases: Pick<GameSessionUseCasesPort, 'submitPlayerChoice'> = {
        submitPlayerChoice: async (input) => {
          submitted.push([input.side, input.subject]);
          return { data: undefined, success: true };
        },
      };
      const handlers = createSeatHandlers(
        'black',
        useCases as GameSessionUseCasesPort,
      ); // only submission is called here
      const { connection } = seatConnection({
        gameId: 'game-1',
        side: 'black',
        subject: 'auth0|human',
      });

      await expect(
        handlers.onPlayerChoice(context, choice, connection),
      ).resolves.toStrictEqual({ ok: true });
      expect(submitted).toStrictEqual([['black', 'auth0|human']]);
    },
  );

  it(
    'turns a refused choice into its choiceRejected payload',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const useCases: Pick<GameSessionUseCasesPort, 'submitPlayerChoice'> = {
        submitPlayerChoice: async () => ({
          message: 'Not your turn',
          status: 400,
          success: false,
        }),
      };
      const handlers = createSeatHandlers(
        'white',
        useCases as GameSessionUseCasesPort,
      ); // only submission is called here
      const { connection } = seatConnection({
        gameId: 'game-1',
        side: 'white',
        subject: 'auth0|human',
      });

      await expect(
        handlers.onPlayerChoice(context, choice, connection),
      ).resolves.toStrictEqual({
        choiceRejected: { errorReason: 'Not your turn', result: false },
        ok: false,
      });
    },
  );

  it(
    'turns a refused resync into its choiceRejected payload',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const useCases: Pick<GameSessionUseCasesPort, 'sendGameSnapshot'> = {
        sendGameSnapshot: async () => ({
          message: 'Seat connection is not registered',
          status: 400,
          success: false,
        }),
      };
      const handlers = createSeatHandlers(
        'white',
        useCases as GameSessionUseCasesPort,
      ); // only the snapshot is called here
      const { connection } = seatConnection({
        gameId: 'game-1',
        side: 'white',
        subject: 'auth0|human',
      });

      await expect(
        handlers.onRequestGameSnapshot(context, connection),
      ).resolves.toStrictEqual({
        choiceRejected: {
          errorReason: 'Seat connection is not registered',
          result: false,
        },
        ok: false,
      });
    },
  );

  it('unregisters the seat when the socket closes', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const unregistered: unknown[] = [];
    const useCases: Pick<GameSessionUseCasesPort, 'unregisterSeatConnection'> =
      {
        unregisterSeatConnection: (connection) => {
          unregistered.push(connection.side);
        },
      };
    const handlers = createSeatHandlers(
      'white',
      useCases as GameSessionUseCasesPort,
    ); // only unregistration is called here
    const { connection } = seatConnection({
      gameId: 'game-1',
      side: 'white',
      subject: 'auth0|human',
    });
    handlers.onClose(context, connection);

    expect(unregistered).toStrictEqual(['white']);
  });
});
