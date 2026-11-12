# Layers

Each directory under `src/` is one layer. Import edges are enforced from [`boundaries.ts`](./boundaries.ts). How they fit together is [`DESIGN.md`](./DESIGN.md). Longer notes stay in the layer README.

| Layer                                                | Import            | Role                                                                                      |
| ---------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------- |
| [Domain](./src/domain/README.md)                     | `@domain`         | Server policy rules does not own. Pure. Shares the inner ring with `prevail-rules`.       |
| [Ports](./src/ports/README.md)                       | `@ports`          | Interfaces and result envelopes. No implementations.                                      |
| Utils                                                | `@utils`          | Cross-cutting helpers: `handleError`, `runDetached`, bearer extraction, type guards.      |
| [Application](./src/application/README.md)           | `@application`    | Use cases and composables. Runs games through rules. No vendor I/O.                       |
| [Infrastructure](./src/infrastructure/README.md)     | `@infrastructure` | Driven adapters: Postgres, Auth0, R2, Typst, in-memory engine ports.                      |
| [Interface: HTTP](./src/interface/http/README.md)    | `@interface`      | Routes implemented from contracts. Handlers call use cases and nothing else.              |
| [Interface: WebSocket](./src/interface/ws/README.md) | `@interface`      | Seat and watcher sockets implemented from contracts.                                      |
| [Composition](./src/composition/README.md)           | `@composition`    | Builds every adapter once, wires use cases, mounts Fastify. The only layer that sees all. |
| Testing                                              | `@testing`        | Shared fixtures that rules factories cannot build. Tests only.                            |

Entry is `src/main.ts`, which starts `app` from `@composition`.
