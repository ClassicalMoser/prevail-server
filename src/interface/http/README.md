# HTTP Interface

Driving adapter for HTTP. Routes are **not** invented here — they are implemented from `@classicalmoser/prevail-contracts` via `implement*Route` helpers.

## Core Principle

**Contracts own path, method, auth, and request Zod validators. Handlers only call use cases.**

```typescript
implementGetRoute(getOwnedArmyByIdContract, logger, {
  handler: async (request, auth) => {
    // request.params/query already parsed
    return ownedArmyUseCases.getOwnedArmyById(auth!.subject, request.params.id);
  },
});
```

## Layout

```
http/
├── route-definitions/   # implement*Route + tryParse* (shared)
├── cards/               # command-card + unit-card registries
├── armies/              # owned-army registry
└── routes.ts            # createRoutes aggregates registries
```

## Pattern: `implement*Route`

Each helper:

1. Copies `contract.method`, `contract.path`, `contract.auth`
2. Sets success status / content type (POST uses `contract.successStatus`; DELETE → 204; media → contract content type)
3. On invoke: `safeParse` params/query/(body) from `contract.validators`
4. Calls the typed handler
5. Catches unexpected errors → `handleError` → 500 envelope

Request parsing lives in `parse-route-request.ts`. Invalid input becomes:

- `Invalid params` / `Invalid query` / `Invalid body` (Zod issue details are not currently forwarded)

### Response schemas

Contracts often declare `validators.data` (e.g. `uuidSchema`, `armySchema`, `emptyObjectSchema`). The server uses those types for handler generics but **does not yet `safeParse` success payloads** before send. Treat response Zod as a contract/type artifact until that changes.

## Mounting (composition)

`registerRoutes` (in `@composition`):

1. Builds `WireRouteRequest` from Fastify
2. If `route.auth.authRequired`, extracts bearer token and calls `AuthPort.checkToken`
3. Attaches `{ subject }` on success
4. Invokes `route.invoke`
5. Maps envelopes to the wire (`sendRouteResult`)

Fastify JSON schema / AJV is intentionally unused — validation is Zod from contracts.

## API Surface (overview)

### Catalog cards (`/command-cards…`, `/unit-cards…`)

- Public GETs and by-ids POST
- Authenticated empty create → **201** uuid
- Version create → **201** full entity
- Delete empties → **204**
- Preview → media `image/svg+xml`

Permissions use the shared `cards:*` namespace for both families.

### Owned armies (`/armies…`)

CQRS-shaped (see contract comments):

| Method | Path                        | Success                                                    |
| ------ | --------------------------- | ---------------------------------------------------------- |
| GET    | `/armies`, `/armies/id/:id` | `Army` / `Army[]` (auth required)                          |
| POST   | `/armies`                   | **201** uuid — read via GET                                |
| PUT    | `/armies/id/:id`            | **200** `{}` — body is `ArmyWriteBody` (`Omit<Army,'id'>`) |
| DELETE | `/armies/id/:id`            | **204** archive                                            |

Identity for updates is the path `:id` only. Empty create bodies must be JSON `{}` (`emptyObjectSchema`).

## Client notes

- Error bodies are `{ message: string }` with an HTTP status — not the internal `DataErrorSignature` shape.
- Bare string success payloads (create ids) are `JSON.stringify`’d so the response is valid JSON.
- CORS allows Authorization and mutating methods; origins from `CLIENT_ORIGINS`.

## Related Documentation

- [`../README.md`](../README.md) — Architecture and request flow
- [`../ports/README.md`](../ports/README.md) — `WireRouteRequest`, handlers, envelopes
- Contract sources: `prevail-contracts/src/contracts/http/`
