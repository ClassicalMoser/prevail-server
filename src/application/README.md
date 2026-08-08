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

## Layout

```
application/
├── use_cases/          # Feature use-case factories (+ colocated *.test.ts)
│   ├── cards/          # command + unit card orchestration
│   ├── armies/         # owned-army use cases
│   └── use-cases-root.ts
├── composable/         # Shared helpers (card projection, asset keys, …)
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

Reusable application logic that is not a full use-case port:

- Projecting command-card versions for storage / render
- Building R2 asset keys
- Replacing nested card ids with names for Typst

Prefer composables when two use cases share non-trivial steps; prefer keeping thin pass-through use cases only when there is truly no policy to own.

## Slice depth

| Slice | Application role today |
|-------|-------------------------|
| Command / unit cards | Rich: project, render, certify, asset writes |
| Owned armies | Thin: mostly storage delegation + envelope mapping |

Prefer moving ownership / composition **policy** into army use cases over growing storage adapters when those rules become non-trivial.

## Testing

- Mock **ports**, not infrastructure.
- Vitest globals are enabled; boundary lint is disabled for `*.test.ts`.
- Prefer covering orchestration branches here; HTTP inject tests belong nearer composition / interface.

## Related Documentation

- [`../README.md`](../README.md) — Architecture
- [`../ports/README.md`](../ports/README.md) — Port and envelope shapes
- [`../infrastructure/README.md`](../infrastructure/README.md) — Adapters use cases call
