# Architecture Decision Records

ADRs capture **why** we chose a shape for the live-game / vs-bot slice, not just what shipped.

## Format

Each ADR uses a light Nygard-style template:

| Section | Purpose |
|---------|---------|
| Status | Accepted / Superseded / Deprecated |
| Context | Forces that made a decision necessary |
| Decision | What we chose |
| Consequences | What becomes easier / harder |
| Tradeoffs | Explicit alternatives we rejected |
| Follow-ups | Real next work (not “accepted for now” choices) |

## Index

| ADR | Title |
|-----|--------|
| [0001](./0001-event-stream-round-reconcile.md) | Event-stream + round-reconcile over WebSocket |
| [0002](./0002-in-memory-session-hosting.md) | In-memory engine ports and session fanout wiring |
| [0003](./0003-vs-bot-entry-and-random-bot.md) | Vs-bot create contract and random bot actor |
| [0004](./0004-contract-driven-ws-seats.md) | Contract-driven seat-bound WebSocket routes |

## Accepted for now (not debt)

These are intentional slice constraints, not oopsies:

- **No game persistence** — in-memory only; fabricate UUIDs as needed.
- **Transient sessions** — process restart drops live games.
- **Bot army from creator’s owned list** — until rules ships a real bot-army builder.
- **Mini-only vs-bot** — locked in the create contract.

## Real follow-ups

1. Rules-side game bootstrap (deal / reserved units / first expected choice) once that API exists.
2. Rules-side bot army (then stop requiring a second owned army id).
3. Reconnect / catch-up protocol when we leave pure transience.
4. WS `access_token` query param — browser necessity; revisit leakage later ([0004](./0004-contract-driven-ws-seats.md)).

When superseding an ADR, leave the old file in place, set Status to Superseded, and link the replacement.
