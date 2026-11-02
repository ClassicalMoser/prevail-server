import type { EnginePorts } from '@classicalmoser/prevail-rules/application';
import { defaultRandom } from '@classicalmoser/prevail-rules/domain';
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
  // Live games draw for real; a recorded flow passes its own fixed source.
  random: defaultRandom,
  roundSnapshotStorage: createInMemoryRoundSnapshotStorage(hooks),
});

export type { InMemoryEnginePortHooks } from './in-memory-engine-port-hooks';
export { createInMemoryEnginePorts };
