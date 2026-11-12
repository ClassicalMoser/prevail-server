import { setTimeout as delay } from 'node:timers/promises';
import type { Event, GameState } from '@classicalmoser/prevail-rules/domain';
import { createFanoutEnginePorts } from './create-fanout-engine-ports';

const choiceEvent = {
  choiceType: 'doneIssuingCommands',
  eventType: 'playerChoice',
  player: 'white',
} as Event; // narrow fixture; Event is a large domain union

const someState = {} as GameState; // the hook only forwards the state; its contents are not read

/** A session that records what the engine hooks send it. */
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

      const { enginePorts, bindSession } = createFanoutEnginePorts();
      const { session, events } = recordingSession();
      bindSession(session);
      await enginePorts.eventStreamStorage.newEventStream('game-1', 0);
      await enginePorts.eventStreamStorage.addEventToStream(
        'game-1',
        0,
        choiceEvent,
      );

      expect(events).toStrictEqual([['game-1', choiceEvent]]);
    },
  );

  it(
    'sends a saved round snapshot to the bound session',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const { enginePorts, bindSession } = createFanoutEnginePorts();
      const { session, snapshots } = recordingSession();
      bindSession(session);
      await enginePorts.roundSnapshotStorage.saveRoundSnapshot(
        'game-1',
        2,
        someState,
      );
      await delay(10);

      expect(snapshots).toStrictEqual([['game-1', 2]]);
    },
  );

  it(
    'drops writes made before a session is bound, without failing',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const { enginePorts } = createFanoutEnginePorts();
      await enginePorts.eventStreamStorage.newEventStream('game-1', 0);

      await expect(
        enginePorts.eventStreamStorage.addEventToStream(
          'game-1',
          0,
          choiceEvent,
        ),
      ).resolves.toMatchObject({ result: true });
    },
  );
});
