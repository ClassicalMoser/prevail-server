# WebSocket Interface

Driving adapter for live in-game seats. Routes are **not** invented here — they are implemented from `@classicalmoser/prevail-contracts` via `implementInGameSeatWs`.

## Protocol

Event-stream + round reconcile (server authoritative):

| When            | Server sends                                 | Client does                                |
| --------------- | -------------------------------------------- | ------------------------------------------ |
| Mid-round       | Seat-projected `playerChoice` / `gameEffect` | `applyEvent` fold locally                  |
| Connect / round | Seat-projected `gameSnapshot`                | Replace local state                        |
| Client resync   | `requestGameSnapshot` → `gameSnapshot`       | Replace local state                        |
| Bad submit      | `choiceRejected` (submitter only)            | Keep prior state                           |
| Always          | Event order is the order in the round        | Send the choice; server accepts or rejects |

Inbound / outbound use tagged envelopes:

```ts
// inbound
{
  type: ('playerChoice' | 'requestGameSnapshot', payload);
}
// outbound
{
  type: ('playerChoice' | 'gameEffect' | 'gameSnapshot' | 'choiceRejected',
    payload);
}
```

Opponent `chooseCard` (and commit\*) card fields are redacted to `'hidden'` via `projectEventForVisibility` in `prevail-rules`.

## Pattern: one route core, two message tables

`implementInGameSeatWs` (seats) and `implementInGameBotVsBotWs` (the watcher) are thin. Each builds its context, its message table, and the rejection its client expects, then hands them to `implementWsRoute`, which does the rest:

1. `findAdmittedConnection`: `safeParse` the path params and require `auth` from composition, or close with 1008
2. `openWsConnection`: run the open handler; a throw closes with 1011
3. `routeWsMessage`, per frame: `readInboundEnvelope` → the route's handler for that `type` → the contract schema check → run off the message loop (`runWsMessage`)
4. A refused or throwing message answers its client with `choiceRejected` (seat) or `stepRejected` (watcher); `sendRejection` writes both
5. On close, the route tells the game so the socket leaves the fan-out set

A seat's table is `playerChoice` and `requestGameSnapshot`; a watcher's is `step` and `requestGameSnapshot`. Adding a message type means adding one `createInboundHandler` entry to a table.

## Entry point: create vs-bot game

`POST /games/vs-bot` (`createVsBotGameContract`) creates an in-memory **mini or standard** game from the caller's two owned army ids (`whiteArmyId` / `blackArmyId`) and returns the game id. The bot seat plays the rules bot (`prevail-rules/bot`) when it is the bot's turn. The authenticated human connects to:

- `/ws/games/id/:gameId/white` or
- `/ws/games/id/:gameId/black`

matching `humanSide` from the create body. Wrong seat / subject → connection closed.

## Entry point: create bot-vs-bot game

`POST /games/bot-vs-bot` (`createBotVsBotGameContract`) creates an in-memory game from the caller's two owned army ids and returns the game id. The creator then connects to:

- `/ws/games/id/:gameId/bot-vs-bot` (`botVsBotInGameWsContract`, built with `implementInGameBotVsBotWs`)

It is the same stream a seat gets, with two differences. There is no seat, so nothing is projected: the snapshot and events are authoritative. And the watcher drives play: inbound `step` plays one bot choice for whichever side owes it, and the choice and its effects arrive as `playerChoice` / `gameEffect`. A step that plays nothing (game over, or the bots are stuck) answers `stepRejected`, as does a malformed message. `requestGameSnapshot` resyncs. Only the creator may connect.

## Mounting (composition)

`registerWs` registers `@fastify/websocket`, authenticates with `AuthPort`, then calls each route’s `onConnection`.

Token sources (either works):

1. `Authorization: Bearer <jwt>` header
2. `access_token` query param — required for browser clients, which cannot set Authorization on WebSocket upgrade

Example: `wss://host/ws/games/id/:gameId/white?access_token=<jwt>`

## Related

- [`../../../STYLE.md`](../../../STYLE.md) — functions, files, commentary, tests
- [`../../../DESIGN.md`](../../../DESIGN.md) — rules kernel, envelopes, live games
- [`../http/README.md`](../http/README.md) — HTTP twin pattern
- [`../../../DESIGN.md`](../../../DESIGN.md) — The stream, seats, watchers and the queue
- Contract sources: `prevail-contracts/src/contracts/ws/` and `.../http/games/create-vs-bot-game.ts`
