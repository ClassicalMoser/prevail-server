# ADR 0006: Bot-vs-bot is watched and stepped over a WebSocket

## Status

Accepted (2026-11-11).

## Context

Bot-vs-bot was HTTP only. Create, get and step each returned the whole authoritative `Game`,
and the client replaced its state from every response. Human-vs-bot reaches the client a
different way: a seat socket sends a snapshot on connect, then streams each event for the
client to fold, with a round snapshot to reconcile. Two delivery paths meant two client
code paths for the same board.

The contracts (`prevail-contracts` `4f5d70f`) now describe bot-vs-bot the seat way:
create returns the game id, and `/ws/games/id/:gameId/bot-vs-bot` streams the game.

## Decision

- The creator opens the bot-vs-bot socket as a **watcher**. A watcher has no seat. It
  receives the same message types a seat does, but authoritative: both seats are bots, so
  there is no hand to hide.
- The watcher **steps** play by sending `step`; the server never advances a bot-vs-bot game
  on its own. Each step plays one bot choice, then drains the effects it causes, so the
  next step starts at a decision.
- Events reach watchers through the same engine hooks as seats (`fanoutEvent`,
  `fanoutRoundSnapshot`), which now also send to the game's watcher set. A step's success
  carries nothing; the stream is the result.
- A step that plays nothing is refused with `stepRejected`: 409 when the game is over or
  the bots are stuck, 400 for a socket that is not registered.
- The HTTP get and step routes are removed.

## Consequences

**Positive**

- The client folds a bot-vs-bot game exactly as it folds a seat's game.
- Steps, snapshots and registration share the per-game queue, so a resync cannot land in
  the middle of a step.

**Negative**

- Stepping needs an open socket; there is no HTTP way to advance a game for scripts.

## Tradeoffs

| Alternative                               | Why not                                                         |
| ----------------------------------------- | --------------------------------------------------------------- |
| Project the watcher's view to one side    | Nothing to hide between two bots; the contract is authoritative |
| Autoplay on a timer, as vs-bot's bot does | The client wants to step by button                              |
| Keep HTTP step beside the socket          | Two ways to advance one game; the contract dropped it           |

## Follow-ups

1. Let other subjects watch (spectators) once games are not just the creator's.
