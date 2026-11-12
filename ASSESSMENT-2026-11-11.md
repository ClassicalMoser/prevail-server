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
   - Done: those suites, and the seat and watcher suites, now call the use case directly with `liveGameStore` / `hostedBotVsBotGame`. Only `game-session-use-cases.test.ts` builds the factory, as it should.
   - The seat and watcher versions of register, unregister, and send-snapshot repeat one pattern.
2. **Factory closures that hold the implementations.** Done for `createOwnedArmyStorage`: each operation is its own file under `adapters/owned-army/`, wrapped in `storageOp` once. Its old suite covered only the update rollback; reads, create and archive had no test until the split. Likewise the command-card and unit-card adapters (`adapters/command-card/`, `adapters/unit-card/`), with `certifyWithLatestRules` shared and `mapUnitCardVersions` added beside its command-card twin.
   - `getLatestRulesVersionIdQuery` sits under the command-card queries but unit cards use it too (`TODO(composition)`). A missing rules version is a silent 500 (`TODO(wrong)` in `certifyWithLatestRules`).
   - `getOwnedArmies` runs a row query and four hydrate queries per army (`TODO(composition)` in the file).
3. Done: the card use cases follow the application README. Each method with its own policy is a file under `use_cases/cards/` and the factories only compose them. The two factory-level suites were split per method; their storage doubles and fixtures moved to `@testing` (`card-use-case-doubles`, `card-fixtures`).
4. Done: `composable/game-session/` is now `access/` (who may touch a game: `subject-for-seat`, `require-*`, `gameNotFound`), `create/`, `session/` (store, meta, queue, loads), `bot/` and `fanout/`.
5. **`use_cases/`** is the one directory name not in kebab-case. It is historical; changing it is the author's call.
6. Done: `certifyCardVersions` took `prepare` as required, so its `undefined as TContext` assertion is gone. No production code asserts a type now.
7. **`return <call>`** appears in HTTP route handlers, `register-ws.ts`, and `storage-op.ts`.
8. Done: suites that defined a no-op `LoggerPort` stub now use `recordingLogger` from `@testing`. `handle-error.test.ts` keeps its own, because it asserts on the calls.
9. **Commentary density** is under 20% in `composition`, `ports` and `testing`.

## Open: marks in the code, for the author's walk

Each is a `TODO(...)` where it stands; this only indexes them.

- `composition/create-fanout-engine-ports.ts` `TODO(wrong)`: a failed round-snapshot send is swallowed with no log line.
- `composition/send-route-result.ts` `TODO(composition)`: a success with neither data nor a 204 status sends nothing.
- `application/use_cases/games/create-vs-bot-game.ts` `TODO(misleading)`: the human's and the bot's missing army are worded differently, and differ from bot-vs-bot.
- `application/use_cases/games/get-seat-subject.ts` `TODO(misleading)`: `get` answers `undefined`, which DESIGN calls `find`; the name is the port's.
- `application/use_cases/armies/owned-army-use-cases.ts` `TODO(composition)`: do archived armies stay referenced by past games?
- `infrastructure/database/adapters/certify-with-latest-rules.ts` `TODO(wrong)`: no rules version is a silent 500.
- `infrastructure/database/adapters/owned-army/get-owned-armies.ts` `TODO(composition)`: one row query and four hydrate queries per army.
- `infrastructure/database/adapters/owned-army/hydrate-army.ts` `TODO(misleading)`: the JSDoc says "latest certified" cards; the by-ids queries filter on no certification.
- `infrastructure/database/queries/command-card/read/get-latest-rules-version-id-query.ts` `TODO(composition)`: rules versions are not command-card data.

## Deferred

- Commentary is still thin by `pnpm check:commentary` (the rules script, ported): source 9% overall (application 11%, infrastructure 5%, interface 9%, composition 18%), specs about 0%. `testing` is not a boundary, so it is not measured. Rules' own target is 25%.
- A self-proof check that no spec reaches its own subject (rules has `check:selfProof`; not ported).
- Spec titles and setup, once structure holds still.
