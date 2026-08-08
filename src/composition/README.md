# Composition Root

The **only** layer that may import application, infrastructure, and interface. Everything else is constructed here and injected inward.

## Core Principle

**Create adapters once. Pass ports. Mount Fastify last.**

```
main.ts
  → configureApp() / app  (@composition)
      → createDbRoot → StoragePort
      → createAuthInfrastructure → AuthPort
      → createInMemoryEnginePorts + createGameSessionUseCases
      → create*RendererAdapter / createAssetStorage
      → createUseCasesRoot → UseCasesPort
      → createRoutes / createWsRoutes
      → cors + registerHttp + registerWs
```

## Layout

| File | Role |
|------|------|
| `app.ts` | Env validation, adapter construction, Fastify instance |
| `register-http.ts` | Thin entry to `registerRoutes` |
| `register-routes.ts` | Auth gate + wire mapping + `sendRouteResult` |
| `register-ws.ts` | `@fastify/websocket` + auth gate + seat mount |
| `cors-options.ts` | Allowed origins / methods / headers |

## Fastify’s role

Fastify is a **driving adapter host**, not a plugin architecture for domain logic:

- HTTP routes mounted via `app.route` from the contract-backed registry
- WS seats mounted via `@fastify/websocket` from `createWsRoutes`
- CORS via `@fastify/cors`
- Logger adapted to `LoggerPort`
- No Fastify JSON schemas / type providers — Zod runs in implement helpers

## Related Documentation

- [`../README.md`](../README.md) — Full request flow
- [`../interface/http/README.md`](../interface/http/README.md) — HTTP route implementation
- [`../interface/ws/README.md`](../interface/ws/README.md) — Live game WS protocol
- [Root `README.md`](../../README.md) — Environment variables
