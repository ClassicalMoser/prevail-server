# Design

How this server is shaped. Package layout is in [`src/README.md`](./src/README.md). The rules engine it runs is [`prevail-rules` `DESIGN.md`](../prevail-rules/DESIGN.md).

## Rules stay in prevail-rules

`@classicalmoser/prevail-rules` is the game kernel: entities, queries, legality, expected events, procedures, validation, and transforms. This process does not reimplement them and does not re-export them through `@domain`.

Local `src/domain` is server policy the rules package does not own. Army display name is that kind of policy. Catalog versus owned cards, and who an army belongs to, belong here too. Auth0, Postgres, Fastify, and R2 do not.

Application composes the rules engines. It calls `createGameRunner` and the engine ports. It does not decide what a player may do. Legality stays behind the rules package. The vs-bot actor still builds a legal choice in this repo, because rules does not yet export a sampler. New choice construction does not grow here. When that sampler exists, this function becomes a call.

## Pure functions and immutability

Domain policy in this repo is a pure function: no I/O, no mutation, same input, same output.

Rules state is immutable. Events are the record of what happened. This server appends them through `EnginePorts` and projects a visibility for each seat. It does not mutate a `GameState` in place.

Mappers read a row or a domain value and return a new value. They do not write back into the object they were given.

## Result envelopes

Expected failures are data, not throws.

- Use cases and storage return `DataErrorSignature` (`success`, `data` or `message` and `status`).
- Archive and delete success is `NoContentSignature`.
- Rules validation returns `ValidationResult`. Callers branch on `result`.
- Unexpected exceptions are caught at the adapter or the HTTP boundary (`handleError`, `implement*Route`).

A mapper that calls `schema.parse` still throws when the card is not a valid domain value. That throw is the insert's failure. Do not catch it inside the mapper and invent a success.

## Layers

Each directory is one layer. Who may import whom is [`boundaries.ts`](./boundaries.ts). What each layer is for is [`src/README.md`](./src/README.md).

```
domain  (+ prevail-rules as the shared kernel)
   ↑
ports ← utils
   ↑
application, infrastructure, interface
   ↑
composition
```

Composition is the only layer that imports application, infrastructure, and interface.

Direct imports of `prevail-rules` from any layer are allowed. Do not add an `@domain` barrel just to re-export rules types.

Contract DTOs stay at the interface. Storage ports speak rules or server domain shapes. Inbound use-case ports still accept some contract write bodies (`ArmyWriteBody`, `CardListItem`). New ports take a domain write. The route maps the contract.

## Sessions

Live games are in-memory. [`docs/adr/0002`](./docs/adr/0002-in-memory-session-hosting.md) records that. Engine port interfaces are the ones rules defines, so a durable adapter replaces the memory adapter without a new domain layer.

Seat identity, fan-out, and the bot's turn loop are application work. The bot submits an event through the runner. It does not apply the event itself.
