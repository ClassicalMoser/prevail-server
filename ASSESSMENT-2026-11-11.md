# Current state — 2026-11-11

What is known to be open in `prevail-server`, and nothing else. It replaces `docs/adr/`, whose decisions are now written as present-tense design in [`DESIGN.md`](./DESIGN.md) and whose history is in version control. It was written from the code and the old ADRs, not from a full scan, so it lists what is known, not everything that could be found.

The gate: `pnpm validate` clean and `pnpm test` passing.

## Open: live games

1. **No reconnect protocol.** A client that drops heals only on the next `gameSnapshot`, or by asking for one with `requestGameSnapshot`. There is no last-acknowledged event number.
2. **No integration test** drives a full round through the socket on two seats, folding what it receives.
3. **`choiceRejected` carries a message string only.** The UI has no structured code to branch on.
4. **Outbound messages are not checked at send time.** Use cases build them and the socket trusts them. An encode-time check would catch a fanout bug earlier. HTTP responses have the same gap.
5. **Round-snapshot fanout runs detached** (`runDetached` in `composition/app.ts`) and swallows its failure. It should log.
6. **Session eviction.** Nothing removes a finished game from memory.
7. **The bot's army is the creator's.** Both armies come from the creator's owned list until rules builds a bot army; then the second army id leaves the create contract. Likewise the bootstrap of a vs-bot game should become a rules call when rules offers one.
8. **No difficulty or temperament** on the create contracts. `getSeatChoice` plays `defaultBotTemperament`.
9. **Only the creator may watch** a bot-vs-bot game. Spectators wait on games that are not one person's.
10. **The bot subject cannot connect in production.** Registering a bot seat is test-only; a spectator or debug seat would make it meaningful.
11. **`access_token` query parameter** carries the bearer for browsers. It leaks into logs more easily than a header. Revisit with a short-lived token, a cookie, or `Sec-WebSocket-Protocol`.
12. **Bot errors are logged, not surfaced.** `trySeatChoice` logs; a stuck bot-vs-bot game answers 409. Nothing alerts anyone.

## Open: structure found by the first scout

These are the cleanup's own backlog, in the order [`AUDIT_PROCESS.md`](./AUDIT_PROCESS.md) would take them.

1. **Twins.**
   - Done: the seat and bot-vs-bot socket implementations now share `implementWsRoute` and its helpers (`findAdmittedConnection`, `openWsConnection`, `routeWsMessage`, `runWsMessage`, `sendRejection`). Each keeps only its own message table.
   - Done: the two create use cases share `loadOwnedArmy`, `buildNewGame` and `persistNewGame` (`composable/game-session/create/`). They still word a missing army differently; vs-bot carries a `TODO(misleading)` for the author to settle.
   - Their suites (`create-*-game.test.ts`) boot `createGameSessionUseCases` to reach the use case, which STYLE says not to. Rewrite them to call the function with `gameSessionStore`.
   - The seat and watcher versions of register, unregister, and send-snapshot repeat one pattern.
2. **Factory closures that hold the implementations.** Done for `createOwnedArmyStorage`: each operation is its own file under `adapters/owned-army/`, wrapped in `storageOp` once. Its old suite covered only the update rollback; reads, create and archive had no test until the split. Likewise the command-card and unit-card adapters (`adapters/command-card/`, `adapters/unit-card/`), with `certifyWithLatestRules` shared and `mapUnitCardVersions` added beside its command-card twin.
   - `getLatestRulesVersionIdQuery` sits under the command-card queries but unit cards use it too (`TODO(composition)`). A missing rules version is a silent 500 (`TODO(wrong)` in `certifyWithLatestRules`).
   - `getOwnedArmies` runs a row query and four hydrate queries per army (`TODO(composition)` in the file).
3. **`composable/game-session/session/`** mixes the store type, session policy (`other-side`, `subject-for-seat`) and `require-*` checks.
4. **`use_cases/`** is the one directory name not in kebab-case. It is historical; changing it is the author's call.
5. **`certify-card-versions.ts`** holds the only type assertion in production code.
6. **`return <call>`** appears in HTTP route handlers, `register-ws.ts`, and `storage-op.ts`.
7. **Logger stubs.** About a dozen suites each define their own `LoggerPort` stub. `recordingLogger` in `@testing` replaces them; move each suite over.
8. **Commentary density** is under 20% in `composition`, `ports` and `testing`.

## Deferred

- A `pnpm check:commentary` script like rules has.
- A self-proof check that no spec reaches its own subject.
- Spec titles and setup, once structure holds still.
