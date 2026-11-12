import type { EnginePorts } from '@classicalmoser/prevail-rules/application';
import type { GameSessionRuntime } from '@application';
import { createInMemoryEnginePorts } from '@infrastructure';
import { runDetached } from '@utils';

/** The part of the session the engine's write hooks call. */
type SessionFanout = Pick<
  GameSessionRuntime,
  'fanoutEvent' | 'fanoutRoundSnapshot'
>;

/**
 * Build the in-memory engine ports, wired so every write reaches the sockets.
 *
 * The engine ports must exist before the session use cases, because those
 * take them as input. But the ports' write hooks must call the session's
 * fan-out, which only exists once the use cases do. So the hooks close over a
 * slot, and `bindSession` fills it once the session is built. Composition
 * binds before the server accepts a request, so the empty slot is only seen
 * while wiring.
 *
 * @returns The engine ports, and the call that connects them to the session.
 */
const createFanoutEnginePorts = (): {
  enginePorts: EnginePorts;
  bindSession: (session: SessionFanout) => void;
} => {
  const slot: { session?: SessionFanout } = {};

  const enginePorts = createInMemoryEnginePorts({
    // An applied event goes to every connected socket right away.
    onEventAppended: (gameId, _round, event) => {
      slot.session?.fanoutEvent(gameId, event);
    },
    // A new round's snapshot is sent off the write path, so a slow socket
    // never holds up the engine.
    onRoundSnapshotSaved: (gameId, round, state) => {
      const session = slot.session;
      if (session === undefined) {
        return;
      }
      // TODO(wrong): runDetached swallows a failed send with no log line, so a
      // dropped snapshot is invisible. The author decides where it is logged.
      runDetached(async () => {
        await session.fanoutRoundSnapshot(gameId, round, state);
      });
    },
  });

  const bindSession = (session: SessionFanout): void => {
    slot.session = session;
  };
  return { bindSession, enginePorts };
};

export { createFanoutEnginePorts };
