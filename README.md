# Prevail Server

> **⚠️ Work In Progress:** This project is in active development. HTTP surfaces, auth wiring, and storage adapters are evolving with [`prevail-contracts`](https://github.com/ClassicalMoser/prevail-contracts) and [`prevail-rules`](https://github.com/ClassicalMoser/prevail-rules). Expect documentation to lag and changes to be breaking.

A Node.js / Fastify backend for **Prevail: Ancient Battles**. It exposes HTTP APIs for catalog cards, owned armies, auth-gated mutations, and Typst-backed card previews.

## What This Server Does

- **Serves contract-defined HTTP routes** from `@classicalmoser/prevail-contracts`
- **Hosts live games** via contract-defined WebSockets (`@fastify/websocket`) with an event-stream + round-reconcile protocol
- **Creates human-vs-bot games** at `POST /games/vs-bot` (in-memory engine ports for now)

Architecture decisions and known debt for the live-game slice: [`docs/adr/`](./docs/adr/README.md).
- **Persists** command cards, unit cards, and player-owned armies in Postgres
- **Authenticates** Auth0 bearer tokens and maps `sub` → local `users`
- **Renders** card preview SVGs via Typst and stores immutable assets in Cloudflare R2
- **Owns a local domain layer** (`src/domain`) for server-specific domain concerns, alongside the shared `@classicalmoser/prevail-rules` kernel

This is a **hexagonal (ports & adapters)** service: Fastify is a driving adapter, not the architecture.

`prevail-rules` sits in the same inner dependency direction as `src/domain`. Direct imports of rules anywhere are fine; local domain is for server-specific concepts, not a re-export façade. See [`src/domain/README.md`](./src/domain/README.md).

## Project Structure

```
src/
├── domain/          # Server-specific domain (alongside prevail-rules)
├── ports/           # Inbound + outbound interfaces (no implementations)
├── application/     # Use cases — wraps domain via ports
├── infrastructure/  # Adapters: Postgres, Auth0, R2, Typst
├── interface/       # Driving adapters: HTTP + WebSocket
├── composition/     # Composition root: wire adapters → Fastify
├── utils/           # Cross-cutting helpers (errors, bearer extract)
└── testing/         # Shared test helpers (alias reserved; grow as needed)
```

Layer import rules are enforced by `boundaries.ts` + oxlint. See [`src/README.md`](./src/README.md) for architecture detail.

## Development

Local packages are linked from sibling checkouts:

```json
"@classicalmoser/prevail-contracts": "link:../prevail-contracts",
"@classicalmoser/prevail-rules": "link:../prevail-rules"
```

Rebuild those packages (`pnpm build`) after contract/rules changes before typechecking the server.

```bash
# Install
pnpm install

# Dev (watch build + restart)
pnpm dev

# Type check
pnpm typecheck

# Test
pnpm test

# Lint, format, typecheck
pnpm validate
```

Path aliases (`@ports`, `@application`, `@infrastructure`, …) are defined in `tsconfig.json`.

### Environment

Required at process start (see `src/composition/app.ts`):

| Variable | Purpose |
|----------|---------|
| `DB_CONNECTION_STRING` | Postgres connection string |
| `AUTH0_DOMAIN` | Auth0 tenant domain |
| `AUTH0_AUDIENCE` | API audience |
| `R2_S3_ENDPOINT` | Cloudflare R2 S3 API endpoint |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | R2 credentials |
| `R2_BUCKET` | Asset bucket name |
| `ALLOWED_MEDIA_ORIGIN` | Allowed origin for unit-card media URLs |

Optional:

| Variable | Default / notes |
|----------|-----------------|
| `CLIENT_ORIGINS` | Comma-separated CORS origins (localhost + production defaults) |
| `CARD_RENDERER_ASSETS_DIR` | Typst assets directory (defaults to `./card-renderer`) |

Use a `.env` file with `node --env-file=.env` (see `pnpm start` / `pnpm dev`).

## Documentation

- [`src/README.md`](./src/README.md) — Hexagonal architecture and request flow
- [`src/domain/README.md`](./src/domain/README.md) — Server domain + prevail-rules
- [`src/ports/README.md`](./src/ports/README.md) — Port conventions and result envelopes
- [`src/interface/http/README.md`](./src/interface/http/README.md) — Contract-driven HTTP pattern
- [`src/interface/ws/README.md`](./src/interface/ws/README.md) — Contract-driven WS / live game protocol
- [`src/application/README.md`](./src/application/README.md) — Use cases and composables
- [`src/infrastructure/README.md`](./src/infrastructure/README.md) — Adapter boundaries
- [`src/composition/README.md`](./src/composition/README.md) — Composition root and Fastify mount

## License

ISC

## Repository

[GitHub](https://github.com/ClassicalMoser/prevail-server)
