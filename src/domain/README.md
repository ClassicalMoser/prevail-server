# Domain Layer

Server-side domain concerns for Prevail. This layer is the **innermost** ring of the hexagonal layout: ports, application, infrastructure, and interface may depend on it; it must not depend on them.

## Relationship to `prevail-rules`

`@classicalmoser/prevail-rules` is part of the **domain dependency direction** — a shared game-rules kernel that this layer extends with server-specific concepts. It is not a peer of `application` and not a substitute for `src/domain/`.

```
application  →  domain (+ may use prevail-rules)
                     ↓
              server-specific domain concepts
                     +
              prevail-rules (shared game kernel)
```

- **Rules package:** pure game entities, schemas, and rules-engine logic (`Army`, `CommandCard`, `UnitType`, validation, transforms, …).
- **Server domain:** concepts and policies that are about *this process* and that rules correctly does not own (identity/ownership language, catalog vs owned resources, archive semantics as domain decisions, pure list-naming policy, …).

**Direct imports from `prevail-rules` anywhere in the codebase are fine.** There is no requirement to funnel rules types through an `@domain` re-export barrel. What matters is dependency *direction*: outer layers must not be imported by domain; domain must not import ports, application, infrastructure, or interface. Avoid heavy-handed aliasing — import the package (or `@domain` modules) where the types are actually defined.

## What belongs here

Examples of **legitimate server domain** (even when thin):

- Identity / ownership concepts that are not game rules (e.g. “authenticated player” as domain language — not Auth0 SDK details)
- Catalog vs owned-resource distinctions (published card versions vs a player’s army composition)
- Invariants about how this server treats rules entities (e.g. write models without identity, archive as a domain decision)
- Pure domain policy that should not live in SQL mappers or HTTP handlers

Keep Auth0, postgres, Fastify, and R2 **out** of this folder — those stay in infrastructure / interface.

## What does *not* belong here

- Re-implementing the rules engine or duplicating entity schemas “for convenience”
- HTTP DTOs from `prevail-contracts` (map at the interface edge)
- Use-case orchestration (application) or SQL (infrastructure)
- Mandatory re-export façades for every rules type

## Practical expectation

On the **server**, this layer will often be **thinner** than on a client that embeds more gameplay UI/state. Much of the rich domain already ships in `prevail-rules`. An honest, small `src/domain` for server-specific concepts is enough — do not invent indirection for its own sake.

## Layout (as it grows)

```
domain/
├── README.md
├── index.ts              # Public barrel for server domain modules
└── …                     # Server-specific modules only when needed
```

## Related Documentation

- [`../README.md`](../README.md) — Hexagonal overview
- [`../application/README.md`](../application/README.md) — Application wraps domain
- [prevail-rules `src/domain/README.md`](../../../prevail-rules/src/domain/README.md) — Shared game domain
- [Root `README.md`](../../README.md) — Setup
