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

| File                                                    | Role                                                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `app.ts`                                                | Reads the environment, builds every adapter once, wires use cases to routes                 |
| `require-env.ts` and the `read-*` / `resolve-*` helpers | Turn environment variables into validated settings; a missing one stops startup, named      |
| `create-fanout-engine-ports.ts`                         | In-memory engine ports whose writes reach the sockets, bound to the session after it exists |
| `register-http.ts`                                      | Thin entry to `registerRoutes`                                                              |
| `register-routes.ts`                                    | Mounts each HTTP route: parse, authenticate, invoke, send                                   |
| `authenticate-http-request.ts`                          | Bearer-token check for a route that needs auth                                              |
| `send-route-result.ts`                                  | Maps a use-case envelope to the HTTP response                                               |
| `register-ws.ts`                                        | Registers `@fastify/websocket` and mounts each socket route                                 |
| `mount-ws-route.ts`                                     | Serves one socket route: authenticate the upgrade, then hand it over                        |
| `authenticate-ws-upgrade.ts`                            | Token check for an upgrading socket (header, or `access_token` in the query)                |
| `adapt-ws-socket.ts`                                    | Presents a `ws` socket as the small socket routes are written against                       |
| `cors-options.ts`                                       | Allowed origins / methods / headers                                                         |

## Fastify’s role

Fastify is a **driving adapter host**, not a plugin architecture for domain logic:

- HTTP routes mounted via `app.route` from the contract-backed registry
- WS seats mounted via `@fastify/websocket` from `createWsRoutes`
- CORS via `@fastify/cors`
- Logger adapted to `LoggerPort`
- No Fastify JSON schemas / type providers — Zod runs in implement helpers

## Related Documentation

- [`../../STYLE.md`](../../STYLE.md) — functions, files, commentary, tests
- [`../../DESIGN.md`](../../DESIGN.md) — rules kernel, envelopes, live games
- [`../../LAYERS.md`](../../LAYERS.md) — Full request flow
- [`../interface/http/README.md`](../interface/http/README.md) — HTTP route implementation
- [`../interface/ws/README.md`](../interface/ws/README.md) — Live game WS protocol
- [Root `README.md`](../../README.md) — Environment variables
