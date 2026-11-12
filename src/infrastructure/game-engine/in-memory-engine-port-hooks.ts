import type { Event, GameState } from '@classicalmoser/prevail-rules/domain';

/** Host hooks for WS fanout (event-stream + round-reconcile protocol). */
interface InMemoryEnginePortHooks {
  /** Called after an event is stored, to send it to the game's connected sockets. */
  onEventAppended?: (gameId: string, roundNumber: number, event: Event) => void;
  /** Called after a round snapshot is stored, so sockets can resync to it. */
  onRoundSnapshotSaved?: (
    gameId: string,
    roundNumber: number,
    gameState: GameState,
  ) => void;
}

export type { InMemoryEnginePortHooks };
