import { setTimeout as delay } from 'node:timers/promises';
import type { Event, GameState } from '@classicalmoser/prevail-rules/domain';
import { createFanoutEnginePorts } from './create-fanout-engine-ports';

// One small player-choice event; the ports only forward it.
const choiceEvent = {
  choiceType: 'doneIssuingCommands',
  eventType: 'playerChoice',
  player: 'white',
} as Event; // narrow fixture; Event is a large domain union

const someState = {} as GameState; // the hook only forwards the state; its contents are not read

/** A session that records what the engine hooks send it. */
// A session stand-in that records what the engine hooks send it, in place of
// the live game's connections.
const recordingSession = (): {
  session: Parameters<
    ReturnType<typeof createFanoutEnginePorts>['bindSession']
  >[0];
  events: unknown[];
  snapshots: unknown[];
} => {
  const events: unknown[] = [];
  const snapshots: unknown[] = [];
  const session = {
    fanoutEvent: (gameId: string, event: Event): void => {
      events.push([gameId, event]);
    },
    fanoutRoundSnapshot: async (
      gameId: string,
      round: number,
    ): Promise<void> => {
      snapshots.push([gameId, round]);
    },
  };
  return { events, session, snapshots };
};

describe('createFanoutEnginePorts function', () => {
  it(
    'sends an appended event to the bound session',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The engine ports are built first and the live session is bound
      // afterwards.
      const { enginePorts, bindSession } = createFanoutEnginePorts();
      const { session, events } = recordingSession();
      bindSession(session);
      // The round-0 stream must exist before an event can be added.
      await enginePorts.eventStreamStorage.newEventStream('game-1', 0);
      await enginePorts.eventStreamStorage.addEventToStream(
        'game-1',
        0,
        choiceEvent,
      );

      // Watchers hear of each appended event: the session got this game id and
      // event.
      expect(events).toStrictEqual([['game-1', choiceEvent]]);
    },
  );

  it(
    'sends a saved round snapshot to the bound session',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The same wiring for round snapshots.
      const { enginePorts, bindSession } = createFanoutEnginePorts();
      const { session, snapshots } = recordingSession();
      bindSession(session);
      await enginePorts.roundSnapshotStorage.saveRoundSnapshot(
        'game-1',
        2,
        someState,
      );
      // The snapshot fan-out is asynchronous, so the test waits briefly before
      // looking.
      await delay(10);

      // The session was told game-1 saved a snapshot for round 2.
      expect(snapshots).toStrictEqual([['game-1', 2]]);
    },
  );

  it(
    'drops writes made before a session is bound, without failing',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // No session is bound: this is a game being set up before anyone is
      // connected.
      const { enginePorts } = createFanoutEnginePorts();
      await enginePorts.eventStreamStorage.newEventStream('game-1', 0);

      await expect(
        enginePorts.eventStreamStorage.addEventToStream(
          'game-1',
          0,
          choiceEvent,
        ),
        // The write still succeeds; there is just nobody to tell.
      ).resolves.toMatchObject({ result: true });
    },
  );
});
