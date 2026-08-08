# Infrastructure

Driven adapters that implement outbound ports. This is where **vendor SDKs and I/O** live.

## Core Principle

**Adapters implement ports. They may import SDKs. Application code must not import this layer.**

Composition constructs adapters (directly or via infra factories such as `createDbRoot`) and injects them into use cases.

## Layout

```
infrastructure/
├── database/         # postgres.js — queries, db-types, mappers, storage adapters
├── auth/             # Auth0 API SDK → AuthPort
├── asset-storage/    # Cloudflare R2 via @aws-sdk/client-s3
├── card-renderer/    # Typst CLI → renderer ports
└── index.ts          # Public factories for composition
```

## Database (`database/`)

| Piece | Role |
|-------|------|
| `queries/` | Tagged SQL functions |
| `db-types/` | Row shapes as returned by postgres |
| `mappers/` | Row ↔ domain (and sometimes contract DTO) |
| `adapters/` | Implement `*Storage` ports |
| `db-root.ts` | Builds `StoragePort` from a connection string |

### Pattern

1. Queries return DB row types only.
2. Mappers convert to rules / `@domain` entities — not contract DTOs when avoidable. Direct `prevail-rules` imports are fine.
3. Adapters catch errors with `handleError`, return `DataErrorSignature`.
4. Multi-step writes (e.g. replace army junction rows) stay transactional when the SQL client allows — prefer clarity over clever helpers.

### Owned armies + users

- `users.user_auth_sub` stores Auth0 `sub`
- `armies.user_id` owns the army; soft-archive via `archived_at`
- Junction tables `army_unit_cards` / `army_command_cards` store composition quantities
- Hydration loads latest catalog card definitions for nested units/command cards (version drift on read is accepted)

## Auth (`auth/`)

`AuthPort.checkToken(token, routeAuth)` → `{ subject }` or `ErrorSignature`.

- Verifies JWT against Auth0 domain/audience
- Enforces `permissionsRequired` from the route contract when non-empty
- Does not attach Fastify-specific types

## Asset storage & card renderer

- **R2:** immutable object put/exists behind `AssetStorage`
- **Typst:** child-process render behind `CommandCardRendererPort` / `UnitCardRendererPort`
- Assets directory defaults to repo `card-renderer/` (overridable via env)

## What stays out of infrastructure

- HTTP status policy beyond mapping thrown errors → envelopes (route success codes live in interface/contracts)
- Fastify request/reply types
- Importing `@application` or `@interface`

## Related Documentation

- [`../README.md`](../README.md) — Architecture and soft-coupling notes
- [`../ports/README.md`](../ports/README.md) — Interfaces to implement
- [Root `README.md`](../../README.md) — Env vars for DB / Auth0 / R2 / Typst
