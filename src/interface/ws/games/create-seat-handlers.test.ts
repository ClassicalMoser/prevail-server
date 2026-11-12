import type { PlayerChoiceEvent } from '@classicalmoser/prevail-rules/domain';
import type { GameSessionUseCasesPort } from '@ports';
import { seatConnection } from '@testing';
import { createSeatHandlers } from './create-seat-handlers';

// A white player's connection to game-1, as the route hands it to the seat
// handlers.
const context = {
  auth: { subject: 'auth0|human' },
  headers: {},
  params: { gameId: 'game-1' },
  side: 'white' as const,
};

// A choice to stop issuing commands; the seat handler forwards it without
// reading it.
const choice = {
  choiceType: 'doneIssuingCommands',
  eventType: 'playerChoice',
  player: 'white',
} as PlayerChoiceEvent; // narrow fixture; the handler only forwards the choice

describe('createSeatHandlers function', () => {
  it('opens by registering the seat it owns', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    // registerSeatConnection records which game, side and subject it was given.
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
    // The use cases are a partial double: only the method this case reads is
    // real.
    const handlers = createSeatHandlers(
      'white',
      useCases as GameSessionUseCasesPort,
    ); // only registration is called here

    // Opening a seat registers it, so the game can send this player its events.
    const opened = await handlers.onOpen(context, vi.fn());

    expect(opened).toMatchObject({ ok: true });
    // The registration names the game, the seat side and the player's own
    // subject.
    expect(registered).toStrictEqual([['game-1', 'white', 'auth0|human']]);
  });

  it('refuses to open when registration fails', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const useCases: Pick<GameSessionUseCasesPort, 'registerSeatConnection'> = {
      // The use case refuses, as when the subject is not the player assigned to
      // this seat.
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

    // The refusal's message becomes the close reason, so the client sees why.
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

      // submitPlayerChoice records the side and subject it was given.
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
      // The seat's open connection, from the @testing double.
      const { connection } = seatConnection({
        gameId: 'game-1',
        side: 'black',
        subject: 'auth0|human',
      });

      await expect(
        handlers.onPlayerChoice(context, choice, connection),
      ).resolves.toStrictEqual({ ok: true });
      // The choice is submitted for the handler's own side and the connection's
      // subject, not whatever the message claims.
      expect(submitted).toStrictEqual([['black', 'auth0|human']]);
    },
  );

  it(
    'turns a refused choice into its choiceRejected payload',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const useCases: Pick<GameSessionUseCasesPort, 'submitPlayerChoice'> = {
        // The use case refuses the choice, as when it is not that player's
        // turn.
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
        // The refusal is sent back as the choiceRejected payload, with the use
        // case's message.
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
        // The use case refuses a resync because this seat is not registered.
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
        // A refused resync uses the same choiceRejected shape as a refused
        // choice.
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

    // unregisterSeatConnection records which side left.
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
    // The socket closes.
    handlers.onClose(context, connection);

    // The seat is unregistered so the game stops sending to a closed socket.
    expect(unregistered).toStrictEqual(['white']);
  });
});
