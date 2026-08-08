# ADR 0001: Event-stream + round-reconcile over WebSocket

## Status

Accepted (2026-08-07)

## Context

Clients need a live, authoritative view of a two-player game without waiting for a full
persistence stack. Mid-round updates are frequent; some information must stay hidden
(opponent hand / awaiting-play card). Re-sending a full projected game on every change is
simple but expensive and makes hidden-info redaction easy to get wrong if the payload is
too large or inconsistently shaped.

`prevail-rules` already models the match as an ordered event stream per round, with
`applyEvent` / `validatePlayerChoice` / `getExpectedEvent` as the kernel API.

## Decision

Use an **event-stream + round-reconcile** protocol on seat WebSockets:

| When | Server sends | Client does |
|------|----------------|-------------|
| Mid-round append | Seat-projected `playerChoice` or `gameEffect` | Fold via `applyEvent` |
| New round | Seat-projected `roundSnapshot` | Replace local state |
| Bad submit | `choiceRejected` to submitter only | Keep prior state |

Rules:

- Server is authoritative; serial `eventNumber` is validated in rules.
- Do **not** broadcast raw authoritative events that leak hidden card identity.
- Project with `projectEventForVisibility` / `projectGameForVisibility` before send.
- Seats stay path-bound (`…/white` \| `…/black`); projection target = path side.

## Consequences

**Positive**

- Clients share the same fold path as rules tests (`applyEvent`).
- Bandwidth stays proportional to decisions/effects, not full board dumps.
- Hidden info has a single projection choke point in rules.

**Negative**

- Clients must implement durable fold + snapshot replace correctly (drift risk).
- Server must fan out every append; missed hooks → silent desync until next snapshot.
- Protocol surface lives in three packages (contracts / rules / server).

## Tradeoffs

| Alternative | Why not (for now) |
|-------------|-------------------|
| Full projected `Game` on every change | Heavier; encourages treating WS as “state sync” and skipping event fold |
| CRDT / OT peer sync | Wrong trust model — server must remain authority for legality |
| Server-only state; client polls HTTP | Worse latency; duplicates seat identity problems |

## Technical debt

- No reconnect resume protocol yet (last-acked `eventNumber` / snapshot request).
  Disconnected clients only heal on next `roundSnapshot` or by reconnecting without a
  defined catch-up message.
- No integration test that drives a full round through WS fold on two seats.
- `choiceRejected` carries a message string only — no structured error codes for UI.
