# WebSocket Interface

Driving adapter for live in-game seats. Routes are **not** invented here — they are implemented from `@classicalmoser/prevail-contracts` via `implementInGameSeatWs`.

## Protocol

Event-stream + round reconcile (server authoritative):

| When            | Server sends                                 | Client does                                    |
| --------------- | -------------------------------------------- | ---------------------------------------------- |
| Mid-round       | Seat-projected `playerChoice` / `gameEffect` | `applyEvent` fold locally                      |
| Connect / round | Seat-projected `gameSnapshot`                | Replace local state                            |
| Client resync   | `requestGameSnapshot` → `gameSnapshot`       | Replace local state                            |
| Bad submit      | `choiceRejected` (submitter only)            | Keep prior state                               |
| Always          | Serial `eventNumber` validated server-side   | Propose next number; server accepts or rejects |

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

## Pattern: `implementInGameSeatWs`

1. Copies `contract.path`, `contract.side`, `contract.auth`
2. On connect: `safeParse` params; requires `auth` from composition
3. On message: `JSON.parse` → envelope `type` → `validators.inbound.*.safeParse` → handler
4. Unexpected errors → logger + `choiceRejected` / close

## Entry point: create vs-bot game

`POST /games/vs-bot` (`createVsBotGameContract`) creates an in-memory **mini** game from the caller's two owned army ids (`whiteArmyId` / `blackArmyId`) and returns the game id. The bot seat auto-plays random legal choices when it is their turn. The authenticated human connects to:

- `/ws/games/id/:gameId/white` or
- `/ws/games/id/:gameId/black`

matching `humanSide` from the create body. Wrong seat / subject → connection closed.

## Mounting (composition)

`registerWs` registers `@fastify/websocket`, authenticates with `AuthPort`, then calls each route’s `onConnection`.

Token sources (either works):

1. `Authorization: Bearer <jwt>` header
2. `access_token` query param — required for browser clients, which cannot set Authorization on WebSocket upgrade

Example: `wss://host/ws/games/id/:gameId/white?access_token=<jwt>`

## Related

- [`../http/README.md`](../http/README.md) — HTTP twin pattern
- [`../../../docs/adr/README.md`](../../../docs/adr/README.md) — Protocol / hosting / vs-bot ADRs
- Contract sources: `prevail-contracts/src/contracts/ws/` and `.../http/games/create-vs-bot-game.ts`
