# ADR 0002: In-memory engine ports and session fanout wiring

## Status

Accepted (2026-08-07)

## Context

`prevail-rules` `EnginePorts` (`gameStorage`, `eventStreamStorage`, `roundSnapshotStorage`,
subscribers) are the intended persistence boundary for the rules runner. Postgres adapters
for live games do not exist yet. We still need a vertical slice: HTTP create → WS seats →
submit → fanout.

Composition must wire “event appended” → “send to connected seats” without inventing a
second event bus that bypasses the runner.

## Decision

1. Implement **`createInMemoryEnginePorts`** in infrastructure with optional hooks:
   - `onEventAppended(gameId, roundNumber, event)`
   - `onRoundSnapshotSaved(gameId, roundNumber, gameState)`
2. Keep **session registry** (meta, connections, per-game submit queue) inside
   `createGameSessionUseCases` (application).
3. Wire fanout in composition with a small **late-binding ref** (see below).
4. Serialize choice submissions per `gameId` with a promise queue so human + bot cannot
   interleave validation against stale state.
5. **No persistence** — game ids are ordinary UUIDs; state lives only in process memory.
   Transience first is deliberate.

## Late-binding fanout (`gameSessionRef`)

This is a construct-order detail, not a second architecture.

- Engine ports are created **first**, and their hooks need to call
  `fanoutEvent` / `fanoutRoundSnapshot` on the session runtime.
- Session use cases are created **second**, and they need the engine ports.

So at the moment hooks are registered, the session object does not exist yet. Composition
keeps a box:

```ts
const gameSessionRef: { current?: GameSessionRuntime } = {};
// hooks close over gameSessionRef and call gameSessionRef.current?.fanout…
const gameSessionUseCases = createGameSessionUseCases({ enginePorts, … });
gameSessionRef.current = gameSessionUseCases;
```

After startup, `current` is always set before any request runs. The optional chaining is
only for that construction window (and for unit tests that never assign the ref).

Alternatives later: factory that returns `{ enginePorts, session }` in one shot, or pass
fanout callbacks into `createGameSessionUseCases` and have the runner invoke them — same
idea, less “ref” shape.

## Consequences

**Positive**

- Unblocks client/server integration without waiting on DB schema for games.
- Fanout stays driven by the same storage writes the runner already performs.
- Per-game queue is a small, testable concurrency control.
- Restart wiping games is acceptable while the protocol is still moving.

**Negative**

- Horizontal scale needs a shared store (out of scope).
- Application owns connection sets — closer to a realtime gateway than a pure use case.

## Tradeoffs

| Alternative | Why not (for now) |
|-------------|-------------------|
| Postgres engine ports first | Correct long-term; blocks the slice and mixes migration work with protocol work |
| Separate pub/sub (Redis) for fanout | Extra infra; premature before single-node protocol stabilizes |
| Fanout inside infrastructure adapter | Would pull WS/session knowledge into infra, worse hexagonal direction |

## Follow-ups

- When persistence arrives, replace in-memory ports; keep the hook → fanout shape if it
  still fits.
- Optional: collapse `gameSessionRef` into a single composition factory for clarity.
- Session map eviction / TTL only matters once process lifetime is long and games accumulate.
- Round-snapshot fanout via `runDetached` should eventually log failures (not block submit).
