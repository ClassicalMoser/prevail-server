# Architecture: Prevail Server

This directory is the **hexagonal application**: domain is the core, ports define the edges, application implements use cases against those ports, infrastructure and interface adapt the outside world, and composition wires everything at startup.

HTTP route contracts and permissions live in **`@classicalmoser/prevail-contracts`**. Shared game rules live in **`@classicalmoser/prevail-rules`** and sit in the same dependency *direction* as local domain — outer layers may import rules directly; local `src/domain` holds server-specific domain that rules does not own.

## Purpose

Provide a **type-safe, testable HTTP backend** that:

- Mounts only routes defined in contracts
- Validates **request** params/query/body with contract Zod schemas
- Delegates work through use-case ports (mockable in tests)
- Keeps vendor SDKs (postgres.js, Auth0, S3/R2, Typst CLI) behind outbound ports
- Grows a local `@domain` for server-specific concepts while wrapping `prevail-rules`

## Layer Map

### 1. **Domain** (`domain/`)

Innermost layer. Holds server-specific domain concerns; shares the inner ring with `@classicalmoser/prevail-rules` (direct imports of rules are fine — no re-export façade required). Often thinner than a client domain — that is expected.

See [`domain/README.md`](./domain/README.md).

### 2. **Ports** (`ports/`)

TypeScript interfaces and shared result envelopes. No implementations. May depend on `@domain` and on rules types.

- **Outbound:** `StoragePort` (and slice ports), `AuthPort`, renderer ports, `AssetStorage`, `LoggerPort`
- **Inbound:** `*UseCasesPort`, `RegisteredRoute` / `RouteRegistry`

See [`ports/README.md`](./ports/README.md).

### 3. **Application** (`application/`)

Use-case factories and composables. Depends on `@domain`, `@ports`, `@utils`, and may import `prevail-rules` directly for game types/schemas.

See [`application/README.md`](./application/README.md).

### 4. **Infrastructure** (`infrastructure/`)

Driven adapters that implement outbound ports:

- `database/` — postgres.js queries, mappers, storage adapters, `createDbRoot`
- `auth/` — Auth0 JWT verification → `{ subject }`
- `asset-storage/` — Cloudflare R2 via AWS S3 SDK
- `card-renderer/` — Typst CLI adapters

See [`infrastructure/README.md`](./infrastructure/README.md).

### 5. **Interface** (`interface/`)

Driving adapters: HTTP route registries (`implement*Route`) and in-game WebSocket seats (`implementInGameSeatWs`) from contracts.

See [`interface/http/README.md`](./interface/http/README.md) and [`interface/ws/README.md`](./interface/ws/README.md).

### 6. **Composition** (`composition/`)

The **only** layer allowed to import application, infrastructure, and interface. Creates adapters, builds `UseCasesPort`, registers CORS + HTTP + WebSocket routes on Fastify.

Entry: `main.ts` → `configureApp()` / `app` from `@composition`.

### 7. **Utils** (`utils/`)

Cross-cutting helpers (`handleError`, bearer token extract, signature type guards). May import `@domain` and `@ports`.

### 8. **Testing** (`testing/`)

Shared test helpers alias. Grow when fixtures/doubles are reused across layers.

## Dependency Policy

Enforced by root [`boundaries.ts`](../boundaries.ts):

```
domain  (+ prevail-rules as inner/shared kernel)
   ↑
ports ← utils
   ↑
application, infrastructure, interface
   ↑
composition (may use all)
```

Dependency *direction* matters: outer layers depend inward. Direct `prevail-rules` imports from application, ports, or infrastructure are allowed — do not add heavy `@domain` aliasing just to re-export rules types.

**Classic violations that must stay absent:**

- `domain` → `ports` / `application` / `infrastructure` / `interface`
- `application` → `infrastructure` / `interface` / `composition`
- `ports` → anything outside ports/domain (plus allowed shared packages)
- `interface` → concrete infrastructure adapters

## Request Flow

```
HTTP (Fastify)
  → registerRoutes (composition)
      → AuthPort.checkToken when route.auth.authRequired
      → WireRouteRequest (+ auth.subject)
  → RegisteredRoute.invoke
      → contract.validators.safeParse (params/query/body)
      → handler → *UseCasesPort
          → StoragePort / RendererPort / AssetStorage
  → sendRouteResult
      → success: JSON body | media | 204
      → error: { message } + status
```

### Auth identity

1. Auth0 access token verified in `AuthPort`
2. JWT `sub` exposed as `RequestAuth.subject`
3. Owned-army flows resolve/create `users.user_auth_sub` → `users.user_id` → `armies.user_id`

Catalog card GETs are public; owned-army routes require a bearer token (some with empty `permissionsRequired`, still authenticated).

## Design Principles

### Ports over frameworks

Fastify, postgres.js, and Auth0 stay at the edges. Handlers and use cases speak port types and `DataErrorSignature`, not Fastify request objects or SQL clients.

### Contract-driven HTTP

Path, method, auth, success status (for POSTs), and **request** validators come from contracts. Handlers only wire use cases. See [`interface/http/README.md`](./interface/http/README.md).

### Result envelopes

Use cases and storage return discriminated success/error objects — they do not throw for expected failures. Unexpected exceptions are caught near the HTTP boundary (`handleError` / `implement*Route`).

### Slice consistency

A feature typically adds:

1. Storage port (+ optional use-case port)
2. DB types / queries / mappers / adapter
3. Use-case factory (+ tests mocking ports)
4. HTTP route registry from contracts
5. Wiring in `db-root`, `use-cases-root`, and `createRoutes`

## Soft Coupling to Watch

These are **not** import-boundary violations, but they erode hexagonal purity:

- Contract DTOs (`ArmyWriteBody`, `CardListItem`) appearing on **storage** ports — prefer domain (or rules) shapes at the persistence edge over HTTP contracts
- Business policy living only in storage adapters (prefer domain policy + application use cases)
- Port JSDoc that names SQL tables (prefer persistence-agnostic language)

## Related Documentation

- [`../docs/adr/README.md`](../docs/adr/README.md) — ADRs for live-game / vs-bot decisions & debt
- [`domain/README.md`](./domain/README.md) — Server domain + prevail-rules
- [`ports/README.md`](./ports/README.md) — Port and envelope conventions
- [`interface/http/README.md`](./interface/http/README.md) — HTTP + contracts
- [`interface/ws/README.md`](./interface/ws/README.md) — WebSocket seats
- [`application/README.md`](./application/README.md) — Use cases
- [`infrastructure/README.md`](./infrastructure/README.md) — Adapters
- [`composition/README.md`](./composition/README.md) — Wiring and Fastify
- [Root `README.md`](../README.md) — Setup, env, scripts
