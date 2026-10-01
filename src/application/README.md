# Application Layer

Use cases and composable helpers. This layer sits outside domain: it **orchestrates** ports and uses domain/rules types; it does not talk to Fastify, SQL, or Auth0 directly.

## Core Principle

**Depend inward (`@domain`, ports, `prevail-rules`). Mock ports in tests. Keep vendor I/O out.**

Direct imports from `@classicalmoser/prevail-rules` are fine — no need to alias rules through `@domain`.

```typescript
const createOwnedArmyUseCases = (deps: {
  ownedArmyStorage: OwnedArmyStorage;
}): OwnedArmyUseCasesPort => ({
  getOwnedArmies: (ownerAuthSub) =>
    deps.ownedArmyStorage.getOwnedArmies(ownerAuthSub),
  // …
});
```

## What a use case is

A use case is one method of an inbound `*UseCasesPort`. The file is named for that method and lives under `use_cases/`. `createVsBotGame` is a use case. `enqueue`, `fanoutEvent`, and `takeBotTurns` are not: no port method is those functions.

The factory `create*UseCases` is the composer. It builds the port from those methods and returns it. It is not a place to hide the methods' bodies, and it is not a place to hide their tests.

## What a composable is

A composable is application logic that is not a port method. It lives under `composable/`, including when only one use case calls it. Shared steps, projections, queues, fan-out, and turn loops are composables.

A composable does not import a use case. A use case may import a composable.

## Layout

```
application/
├── use_cases/          # Port methods only, one per file, plus the create*UseCases composer
│   ├── cards/
│   ├── armies/
│   ├── games/          # GameSessionUseCasesPort methods and its composer
│   └── use-cases-root.ts
├── composable/
│   ├── game-session/   # Queue, fan-out, seat projection, bot turn loop
│   └── …               # Card projection, asset keys, certification
└── index.ts
```

Note the folder name `use_cases` (underscore) vs `ports/use-cases` (hyphen) — historical; do not “fix” casually.

## Pattern: Use-case factory

1. Define a small `*Deps` interface of required ports.
2. Export `create*UseCases(deps): *UseCasesPort`.
3. Map storage/result shapes to the inbound port contract (e.g. `void` → `EmptyObject`, archive → `noContentSuccess()`).
4. Colocate unit tests that build fake ports with `vi.fn`.

Wire factories through `createUseCasesRoot` — composition passes real adapters.

## Composables (`composable/`)

These are the application functions that are not port methods:

- Projecting command-card versions for storage / render
- Building R2 asset keys
- Replacing nested card ids with names for Typst
- Live-game session support: the per-game queue, seat fan-out, authoritative loads, and the bot turn loop

Prefer a composable when the step is not itself a port method. A thin pass-through stays a use case only when the port method has no other policy to own.

## Slice depth

| Slice                | Application role today                             |
| -------------------- | -------------------------------------------------- |
| Command / unit cards | Rich: project, render, certify, asset writes       |
| Owned armies         | Thin: mostly storage delegation + envelope mapping |

Prefer moving ownership / composition **policy** into army use cases over growing storage adapters when those rules become non-trivial.

## Testing

How to write a test, and where the file lives, is [`../../STYLE.md`](../../STYLE.md).

- Mock **ports**, not infrastructure.
- Vitest globals are enabled; boundary lint is disabled for `*.test.ts`.
- A use case's test sits next to that use-case file. A composable's test sits next to that composable file. HTTP inject tests belong nearer composition / interface.

## Related Documentation

- [`../../STYLE.md`](../../STYLE.md) — functions, files, commentary, tests
- [`../../DESIGN.md`](../../DESIGN.md) — rules kernel, envelopes, layers
- [`../README.md`](../README.md) — Architecture
- [`../ports/README.md`](../ports/README.md) — Port and envelope shapes
- [`../infrastructure/README.md`](../infrastructure/README.md) — Adapters use cases call
