# Design

How this server is shaped. What each layer is for is [`LAYERS.md`](./LAYERS.md). The rules engine it runs is [`prevail-rules` `DESIGN.md`](../prevail-rules/DESIGN.md).

## Rules stay in prevail-rules

`@classicalmoser/prevail-rules` is the game kernel: entities, queries, legality, expected events, procedures, validation, transforms, and the bot. This server does not reimplement any of it and does not re-export it through `@domain`. Direct imports of rules from any layer are allowed.

Local `src/domain` is server policy the rules package does not own: an army's display name, catalog versus owned cards, who an army belongs to. Auth0, Postgres, Fastify, and R2 do not belong there.

Application composes the rules engines. It calls `createGameRunner` and the engine ports. It does not decide what a player may do, and it does not build a choice: the bot's choices come from `prevail-rules/bot`.

## Contracts stay in prevail-contracts

`@classicalmoser/prevail-contracts` owns every route: path, method, auth, success status, and the Zod validators for what comes in. HTTP routes and WebSocket routes are both implemented from a contract (`implement*Route`, `implementInGame*Ws`); this server does not invent a path or an envelope. A shape the client and server must agree on is changed in contracts first.

Contract DTOs stay at the interface. Storage ports speak rules or server domain shapes. Inbound use-case ports still accept some contract write bodies (`ArmyWriteBody`, `CardListItem`). A new port takes a domain write, and the route maps the contract to it.

## Pure functions and immutability

Domain policy in this repo is a pure function: no I/O, no mutation, same input, same output.

Rules state is immutable. Events are the record of what happened. This server appends them through `EnginePorts` and projects a view for each seat. It does not mutate a `GameState` in place.

Mappers read a row or a domain value and return a new value. They do not write back into the object they were given.

## Faults and absence

- **Expected failures are data.** Use cases and storage return `DataErrorSignature` (`success`, then `data`, or `message` and `status`). Archive and delete success is `NoContentSignature`. Rules validation returns `ValidationResult`; callers branch on `result`.
- **`find`, `get` and `require`.** A `find*` answers `undefined` when absence is an ordinary answer (no seat connected yet). A `get*` or `require*` insists, and answers with an error envelope or a throw when the thing is not there.
- **Unexpected failures throw, and are caught once at the edge.** `implement*Route` and the WebSocket implementations catch, log through `handleError`, and answer 500 or close 1011. Nothing between a use case and that edge catches a throw to turn it into a success.
- A mapper that calls `schema.parse` throws when the card is not a valid domain value. That throw is the insert's failure. Do not catch it inside the mapper and invent a success.

## Layers

Each directory is one layer. Who may import whom is [`boundaries.ts`](./boundaries.ts). What each layer is for is [`LAYERS.md`](./LAYERS.md).

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

A method of an inbound `*UseCasesPort` is a use case and lives under `use_cases/`. Application logic that is not a method of that port is a composable and lives under `composable/`. A file does not become a use case because a use case calls it. See [`src/application/README.md`](./src/application/README.md).

## Requests

An HTTP request runs:

```
Fastify → registerRoutes (composition)
  → AuthPort.checkToken, when the contract requires auth
  → RegisteredRoute.invoke
      → contract validators safeParse params, query, body
      → handler → *UseCasesPort → StoragePort / renderer / AssetStorage
  → sendRouteResult: JSON, media, or 204; an error envelope becomes { message } and its status
```

Identity is the Auth0 `sub`. `AuthPort` verifies the token and exposes it as `RequestAuth.subject`. An owned-army flow resolves that subject to a local user, creating one on first use.

## Live games

A live game is a session: the game in memory, who may connect to it, the sockets connected now, and a queue. Games are not persisted, and a restart drops them. That is a deliberate stage, not an oversight. The engine ports are the ones rules defines, so a durable adapter replaces `createInMemoryEnginePorts` without a new layer.

### The stream

A socket receives the game as a stream of events, never as a board resent on every change:

| When                           | Server sends                         | Client does               |
| ------------------------------ | ------------------------------------ | ------------------------- |
| Connect, a new round, resync   | `gameSnapshot`                       | Replace its state         |
| A choice or effect is applied  | `playerChoice` or `gameEffect`       | Fold it with `applyEvent` |
| A seat's choice is refused     | `choiceRejected`, to that seat only  | Keep its state            |
| A watcher's step plays nothing | `stepRejected`, to that watcher only | Keep its state            |

The client folds events the same way the rules specs do, and a round snapshot reconciles any drift. `requestGameSnapshot` asks for one at any time.

What a seat may not see is hidden by rules: every event and snapshot sent to a seat is projected for that side (`projectEventForVisibility`, `projectGameForVisibility`), so the opponent's chosen card reads `'hidden'`. That projection is the only place hidden information is removed. A watcher is sent the authoritative game, because both its seats are bots and there is no hand to hide.

### Seats and watchers

A seat is bound by its path, `/ws/games/id/:gameId/white` or `/black`, not by a field in a message, so a socket cannot play the other side by mistake. A human-vs-bot game records the human's subject and side; only that subject may open that seat.

A bot-vs-bot game has no seats. Its creator opens `/ws/games/id/:gameId/bot-vs-bot` as a watcher and steps the game: each `step` plays one bot choice for whichever side owes it, then the effects it causes, so the next step starts at a decision. The server never advances a bot-vs-bot game on its own. Only the creator may watch.

Browsers cannot set `Authorization` on a WebSocket upgrade, so `registerWs` also accepts the token as an `access_token` query parameter. A token in a URL is easier to leak through logs than one in a header; that is a known cost.

### The queue and the fan-out

Every change to a game runs through that game's queue (`enqueue`): a seat's choice, the bot's turns that follow it, a step, a registration, a snapshot. Two of them never validate against the same stale state, and a resync cannot land in the middle of a step.

Events reach sockets through the engine's own storage writes. The in-memory engine ports take two hooks, `onEventAppended` and `onRoundSnapshotSaved`, and composition points them at `fanoutEvent` and `fanoutRoundSnapshot`. There is no second event bus. The engine ports must exist before the session use cases that need them, so composition hands the hooks a late-bound reference to the session, which is set before any request runs.

### The bot

The bot's decisions come from `prevail-rules/bot`. `getSeatChoice` is the one place the server calls it. It hands the bot the seat's projected view, not the authoritative game, so the bot sees what a human in that seat would. The server asks the bot only for a seat that owes a choice (`findOwingSeats`), because the rules bot throws for a seat that does not.

In a human-vs-bot game the bot plays as soon as it owes, after the game is created and after each of the human's choices (`takeBotTurns`). In a bot-vs-bot game it plays only when the watcher steps.

A bot choice the rules refuse is a bug, in rules or in this server, not a normal refusal. `trySeatChoice` logs the throw and answers `undefined`. A human-vs-bot game then stops the bot without failing the human's request; a bot-vs-bot game is marked `stuck`, and later steps answer 409.

Until rules builds a bot's army, the creator supplies both armies from their own owned list. Mini and standard are the modes these games can be created in; each army must pass that mode's composition rules before the game is saved.
