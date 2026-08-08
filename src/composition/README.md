# Composition Root

The **only** layer that may import application, infrastructure, and interface. Everything else is constructed here and injected inward.

## Core Principle

**Create adapters once. Pass ports. Mount Fastify last.**

```
main.ts
  → configureApp() / app  (@composition)
      → createDbRoot → StoragePort
      → createAuthInfrastructure → AuthPort
      → create*RendererAdapter / createAssetStorage
      → createUseCasesRoot → UseCasesPort
      → createRoutes → RouteRegistry
      → cors + registerHttp(app, auth, routes)
```

## Layout

| File | Role |
|------|------|
| `app.ts` | Env validation, adapter construction, Fastify instance |
| `register-http.ts` | Thin entry to `registerRoutes` |
| `register-routes.ts` | Auth gate + wire mapping + `sendRouteResult` |
| `cors-options.ts` | Allowed origins / methods / headers |

## Fastify’s role

Fastify is a **driving adapter host**, not a plugin architecture for domain logic:

- Routes mounted via `app.route` from the contract-backed registry
- CORS via `@fastify/cors`
- Logger adapted to `LoggerPort`
- No Fastify JSON schemas / type providers — Zod runs in `implement*Route`

## Related Documentation

- [`../README.md`](../README.md) — Full request flow
- [`../interface/http/README.md`](../interface/http/README.md) — Route implementation
- [Root `README.md`](../../README.md) — Environment variables
