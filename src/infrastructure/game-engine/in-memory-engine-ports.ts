import type { EnginePorts } from '@classicalmoser/prevail-rules/application';
import { createInMemoryEventStreamStorage } from './in-memory-event-stream-storage';
import { createInMemoryGameStorage } from './in-memory-game-storage';
import type { InMemoryEnginePortHooks } from './in-memory-engine-port-hooks';
import { createInMemoryRoundSnapshotStorage } from './in-memory-round-snapshot-storage';

/**
 * In-memory {@link EnginePorts} for live games (no durable persistence).
 * Optional hooks drive WebSocket fanout on event append / round snapshot.
 */
const createInMemoryEnginePorts = (
  hooks: InMemoryEnginePortHooks = {},
): EnginePorts => ({
  eventStreamStorage: createInMemoryEventStreamStorage(hooks),
  gameStateSubscribers: [],
  gameStorage: createInMemoryGameStorage(),
  roundSnapshotStorage: createInMemoryRoundSnapshotStorage(hooks),
});

export type { InMemoryEnginePortHooks } from './in-memory-engine-port-hooks';
export { createInMemoryEnginePorts };
