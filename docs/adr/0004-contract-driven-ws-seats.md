# ADR 0004: Contract-driven seat-bound WebSocket routes

## Status

Accepted (2026-08-07)

## Context

HTTP already follows a hard rule: paths, auth, and request validators come from
`@classicalmoser/prevail-contracts`; the server only implements handlers. Live games need
the same discipline so client and server do not invent divergent envelopes.

Browsers cannot set `Authorization` on WebSocket upgrade in all environments, so token
delivery needs a fallback.

## Decision

1. Define in-game seat contracts in prevail-contracts with:
   - path including `:gameId` and fixed side segment
   - inbound `playerChoice` validator
   - outbound tagged union under `validators.outbound`
     (`playerChoice` \| `gameEffect` \| `roundSnapshot` \| `choiceRejected`)
2. Mirror HTTP with `implementInGameSeatWs` → `RegisteredWsRoute`.
3. Composition `registerWs` authenticates via `AuthPort`, accepting either:
   - `Authorization: Bearer <jwt>`, or
   - `access_token` query param (browser clients)
4. On connect, session use cases enforce seat assignment (`humanSubject` / `BOT_SUBJECT`).

## Consequences

**Positive**

- One contract source for client codegen / shared types.
- Seat identity is structural (URL), not a free-form message field — harder to “play as
  black while connected as white” by mistake.
- Same auth port as HTTP; permissions can stay on the contract.

**Negative**

- Two routes per game template instead of one multiplexed socket.
- Query-param tokens appear in logs, proxies, and `Referer` more easily than headers.

## Tradeoffs

| Alternative                                    | Why not (for now)                                            |
| ---------------------------------------------- | ------------------------------------------------------------ |
| Single `/ws/games/:id` + side in first message | More flexible; weaker binding; easier to mishandle auth race |
| Server-invented WS paths outside contracts     | Breaks the HTTP precedent; client drift                      |
| Cookie-only WS auth                            | Possible later; Auth0 SPA currently bearer-oriented          |

## Technical debt

- Query-param bearer is a **known compromise** — document in ops/security review; prefer
  short-lived tokens; consider moving to cookie/`Sec-WebSocket-Protocol` later.
- No outbound schema enforcement at send time (we trust use-case construction); HTTP
  responses have a similar gap. Adding encode-time checks would catch fanout bugs earlier.
- Bot subject cannot usefully “connect” in production; registering bot seats is test-only
  noise unless we formalize spectator/debug seats.
- WS README and HTTP README must stay twin docs — already easy to leave stale when
  contracts move.
