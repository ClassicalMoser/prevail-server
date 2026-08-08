# Ports

This directory defines the **edges of the application**: what the core needs from the outside world (outbound) and what the outside world may call into (inbound). Implementations live under `infrastructure/` or `application/`; wiring happens in `composition/`.

## Core Principle

**Ports are TypeScript interfaces (and small result types). They must not import adapters, Fastify, or postgres.**

Allowed dependencies: `@domain`, other `@ports` modules, and shared packages (`prevail-rules`, contracts where needed). Direct `prevail-rules` imports are fine. Prefer rules/domain shapes over HTTP DTOs from `prevail-contracts` on storage ports.

## Result Envelopes

Located in `data-error-signature-port.ts`.

```typescript
type DataErrorSignature<T> =
  | { success: true; data: T }
  | { success: false; message: string; status: number };

/** DELETE success — HTTP 204 with no body */
type NoContentSignature = { success: true };
```

### Pattern

1. **Expected failures** return `success: false` with an HTTP-ish `status` (404, 400, 500, …). Do not throw for “not found.”
2. **DELETE / archive** success uses `NoContentSignature` (via `noContentSuccess()`), not `DataErrorSignature<void>`, so the HTTP adapter can emit 204 without a body.
3. **CQRS empty success** (e.g. army PUT) may return `DataErrorSignature<EmptyObject>` with `data: {}` when the contract’s success body is `EmptyObject`.
4. **Unexpected exceptions** are mapped with `handleError` in adapters / `implement*Route`.

Wire JSON errors are always `{ message }` — the internal `{ success, status }` envelope does not leave the process.

## Outbound Ports

| Port | Role |
|------|------|
| `StoragePort` | Facade over storage slices |
| `CommandCardStorage` / `UnitCardStorage` | Catalog card persistence |
| `OwnedArmyStorage` | Player army persistence |
| `UserStorage` | Auth0 `sub` → local user |
| `AuthPort` | Bearer verify → `{ subject }` or error |
| `CommandCardRendererPort` / `UnitCardRendererPort` | Typst preview |
| `AssetStorage` | Immutable R2 objects |
| `LoggerPort` | Structured logging without Fastify types |

**Naming:** storage slices are `*Storage`; service-style ports often end in `Port`.

## Inbound Ports

| Port | Role |
|------|------|
| `*UseCasesPort` | Application API for a feature |
| `UseCasesPort` | Aggregate of feature use-case ports |
| `RegisteredRoute` / `RouteRegistry` | HTTP driving-adapter contract |

`routes-port.ts` intentionally speaks HTTP vocabulary (`method`, `path`, `WireRouteRequest`) — it is the port for the Fastify adapter, not domain language.

### Auth on the wire

```typescript
interface RequestAuth {
  subject: string; // Auth0 JWT `sub`
}
```

`WireRouteRequest.auth` is set by composition after a successful `AuthPort.checkToken`. Handlers receive `auth` as a second argument.

## Pattern: Storage vs Use Cases

- **Storage ports** — persistence operations; keep them free of orchestration when possible.
- **Use-case ports** — application API matching (or close to) HTTP contracts; may map envelopes (e.g. storage `void` → `EmptyObject` / `NoContentSignature`).

## Related Documentation

- [`../README.md`](../README.md) — Architecture overview
- [`../application/README.md`](../application/README.md) — Implementing use-case ports
- [`../infrastructure/README.md`](../infrastructure/README.md) — Implementing outbound ports
