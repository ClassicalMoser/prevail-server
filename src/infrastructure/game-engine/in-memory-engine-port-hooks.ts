import type { Event, GameState } from '@classicalmoser/prevail-rules/domain';

/** Host hooks for WS fanout (event-stream + round-reconcile protocol). */
interface InMemoryEnginePortHooks {
  onEventAppended?: (gameId: string, roundNumber: number, event: Event) => void;
  onRoundSnapshotSaved?: (
    gameId: string,
    roundNumber: number,
    gameState: GameState,
  ) => void;
}

export type { InMemoryEnginePortHooks };
