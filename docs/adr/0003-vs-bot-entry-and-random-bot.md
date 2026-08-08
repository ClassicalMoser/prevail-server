# ADR 0003: Vs-bot create contract and random bot actor

## Status

Accepted (2026-08-07)

## Context

We need a product entry point that is not “bootstrap-only / tests”. Human-vs-bot is the
smallest authentic loop: one authenticated human, one server-driven opponent, one live
seat connection.

Client UX has the user pick **both** armies from their owned list. Mode for this slice is
**mini** (small board). A rules-built bot army is planned but not available yet.

Rules expose `getLegalPlayerChoiceOptions` as the shared presentation surface for UI and
bots, but does **not** expand every choice into a full `PlayerChoiceEvent` list (issue
command lines, move destinations, setup placements, etc.).

## Decision

### Create contract (`CreateVsBotGameBody`)

- `humanSide`, `gameMode: 'mini'`, `whiteArmyId`, `blackArmyId`
- Both army ids must resolve as **owned armies of the creating subject** (stand-in until
  rules supplies a bot army)
- Human seat subject = Auth0 `sub`; bot seat subject = constant `bot:prevail`
- Game id is a server-generated UUID; no durable store
- Mini is locked in contract + use case

### Bot actor

- After create and after each successful **human** submit, run `takeBotTurns` while the
  next expected choice is the bot side (or `bothPlayers` with a bot-sampleable option).
- `selectRandomPlayerChoice` lives in the **server** application layer: pure function over
  `LegalPlayerChoiceOptions` + authoritative `GameState`, injectable RNG for tests.
- For atom-style options, expand with existing rules helpers
  (`getLegalUnitMoves`, `getLegalUnitsForIssueCommand`, …) and pick randomly.

### Do we expect bot errors?

**No — not on the happy path.** If options come from `getLegalPlayerChoiceOptions` and the
selector builds a member of that legal set, `handlePlayerChoiceSubmission` should accept
it. A failed bot submit or a `null` selection while it is still the bot’s turn means a
**bug** (selector/validator drift, incomplete expansion, or bad game bootstrap), not a
normal control-flow signal to the human client.

Today `takeBotTurns` simply stops on failure. That is fine as a crash-avoidance default;
it is not a productized “bot resigns” path. If we start seeing failures in practice, fix
the selector/bootstrap — do not paper over with user-facing `choiceRejected` for the bot.

## Consequences

**Positive**

- Matches current client create UX (two owned armies).
- Bot and future UI share the same legality entry point.
- Mini-only reduces board/army validation surface while the protocol settles.

**Negative**

- Creator-owned “bot army” is a temporary stand-in.
- Server-side expansion can drift if rules add choice shapes without updating the selector.

## Tradeoffs

| Alternative | Why not (for now) |
|-------------|-------------------|
| Hardcoded tiny starter for bot seat | Conflicts with client’s dual-army picker; rules bot army coming later |
| Single `armyId` body | Cleaner API; requires client change now |
| Bot policy inside `prevail-rules` | Rules stay pure/kernel; server owns I/O and process loop (army builder may still land in rules) |
| Full enumeration of every legal event in rules | Ideal for bots; large rules change — deferred |

## Follow-ups

1. **Rules bootstrap** for a playable vs-bot game (deal / reserved units / first expected
   choice) when that API is ready — empty shell + armies is only a placeholder.
2. **Rules-built bot army** — then drop the second owned-army requirement from the
   contract/client.
3. Log unexpected bot submit failures (dev signal), still without treating them as normal
   client errors.
4. Keep contracts as the negotiation point when create-body shape moves again.
