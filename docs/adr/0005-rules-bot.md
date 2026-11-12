# ADR 0005: The bot's decisions come from `prevail-rules/bot`

## Status

Accepted (2026-11-11). Supersedes the **Bot actor** section of [0003](./0003-vs-bot-entry-and-random-bot.md).

## Context

ADR 0003 kept a random selector in the server: it expanded each `LegalPlayerChoiceOptions`
shape into one event and picked uniformly. That was a stand-in. Rules now exports a bot
(`@classicalmoser/prevail-rules/bot`): `findBotChoice(view, seat, temperament, random)`
appraises the board and picks from the same legal options, leaning by a `BotTemperament`.

Rules may later move the bot into its own package. The server should not care where the
decision is made, only that it is handed a seat view and returns a legal choice.

## Decision

- The server's random selector (`composable/player-choice/`) is removed.
- `getSeatChoice` (`composable/game-session/bot/get-seat-choice.ts`) is the one place the
  server calls the rules bot (`getBotChoice`). It projects the authoritative state to the bot seat's view
  (`whiteSeen` / `blackSeen`) so the bot cannot read the opponent's hand, and plays
  `defaultBotTemperament`.
- The rules bot throws when asked for a seat that owes nothing, so the server asks only for a
  seat `findOwingSeats` names. When both sides choose cards at once, that is the seats whose
  card events still appear in the authoritative options.
- `takeBotTurns` (vs-bot) and `sampleEitherSideChoice` (bot-vs-bot) both go through
  `trySeatChoice`, which logs a throw and returns undefined. Vs-bot then stops the bot loop
  without failing the human's request; bot-vs-bot marks the game `stuck`.
- The rules `RandomSource` is used directly; the server no longer defines its own.

0003's position on bot errors still holds: a bot choice the rules refuse is a bug, now in
rules rather than in the server.

## Consequences

**Positive**

- The bot plays to win instead of at random, and improves as rules improves it.
- The server no longer has to keep a choice expander in step with new rules choice shapes.

**Negative**

- Bot behaviour, and its speed per decision, is now owned outside this repo.

## Tradeoffs

| Alternative                             | Why not                                                         |
| --------------------------------------- | --------------------------------------------------------------- |
| Keep the random selector beside the bot | Two bots to maintain; random is not a product opponent          |
| Hand the bot the authoritative state    | It would see the opponent's hand, which no human seat can       |
| Let the client choose a temperament     | No contract field for it yet; default temperament is enough now |

## Follow-ups

1. If the bot moves to its own package, change the import in `get-seat-choice.ts` only.
2. A temperament (or difficulty) on the create contracts, once the client wants one.
