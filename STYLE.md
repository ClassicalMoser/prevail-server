# Style

Code shape for this repository. What each layer is for is [`LAYERS.md`](./LAYERS.md). Import edges are in [`boundaries.ts`](./boundaries.ts): a package imports only the aliases that file allows.

This is the shape of [`prevail-rules` `STYLE.md`](../prevail-rules/STYLE.md), adapted to a server. Where the two differ, this file says so.

## Shape

Small functions, small files. One primary export per file. A function does one job. A name says what that job is.

A barrel (`index.ts`) re-exports those files. It is not a second implementation.

No classes. Shared behavior is a function, or a closure that returns functions. A factory (`create*Storage`, `create*UseCases`) is a composer: it closes over its deps and hands back named functions that live in their own files. It is not a place to write their bodies. A factory whose returned object holds the implementations inline has grown into a class without the word.

Functions should not turn into skyscrapers. A nested function or an `if` body past ten lines or so is a function of its own, and its name says what that branch does.

`return` stands on its own line and returns a name. Do not return a call. Do not build that call's arguments inline. Name each piece, then pass the names.

```typescript
const rows = units.map((unit) => ({
  army_id: armyId,
  unit_card_id: unit.unitType.id,
  quantity: unit.count,
}));
return rows;
```

An exported function has an explicit return type. `isolatedDeclarations` is not on in this repo yet. Write the return type anyway.

No overloads, unless a single signature cannot say the return. An overload is a second assertion of the type.

Two functions that differ by a side, a label, or one extra step are one function with a parameter, or two thin callers of a shared one. A twin left in place drifts: its error message, its status code, or its log line stops matching the other's, and nobody can say which one is right.

When splitting modules grows a folder past about a dozen, group them into sub-folders by what each part answers, with one barrel per folder.

Filenames are **kebab-case**. Oxlint enforces that. The rules package uses camelCase filenames. This server does not.

## Names

Names use the game's vocabulary where they touch the game: a seat, a side, a player choice, a round, an army. Where they touch the server, they use the server's own small vocabulary and nothing else: a **session** (one live game in memory), a **seat** (a side a human or bot plays), a **watcher** (a socket that sees the authoritative game and has no seat), the **catalog** (published cards anyone may read), an **owned army** (an army a subject built). Do not coin a synonym for one of these, and do not borrow a vendor's word (a Fastify `reply`, a postgres `row`) past the adapter that speaks it.

A reader that answers `undefined` for an absence is a `find*`. One that throws or returns an error envelope is a `get*` or a `require*` ([`DESIGN.md`](./DESIGN.md)).

## TypeScript and Zod

The project is strict about both. Do not use a type assertion (`as`, `!`) or `@ts-ignore`. The exception is a test that must pass a value the type forbids, and only in a `*.test.ts` file, with a comment on that line saying why.

An assertion is a narrowing the compiler cannot check: `as Foo`, `x!`, `as unknown as`. `as const`, a widening `as readonly …`, and a `never` in an exhaustive default define a type the compiler verifies; they are not assertions.

If a cast is only hiding a type that can be written, write the type. Vendor values (S3 status, Fastify query, Typst stdout, Auth0 permissions, socket handles, parsed JSON) are narrowed with checks, not assertions.

`schema.parse` throws on an invalid command-card write. That is the insert's failure, described in [`DESIGN.md`](./DESIGN.md).

## Commentary

Commentary is extensive. **More than 25% is not too much. Less than 10% is usually not enough to infer intent cleanly.** The measure is comment lines inside function bodies over code lines inside them; JSDoc above a declaration does not count toward it. A comment restating the code raises the number and makes the file worse, so the number is a symptom of explanation and never a target.

Every exported function and every struct has a JSDoc block: a few lines saying what it is and why it exists. Leave `@param` and `@returns` in place. A shorter header is not a cleanup, so leave a long one alone. When a function does several steps, comment each step: what it writes, and why it is there.

A comment says why the step is there, in terms of what it does for someone using Prevail: a player at a seat, a watcher stepping two bots, an army builder saving a list, an author publishing a card. Where a step encodes a rule of the game, the comment names the rule. Where it encodes a server policy (only the creator may watch; a bot error is a bug, not a refusal), the comment names the policy. A label naming the operation is not enough: it repeats what the reader can see and leaves out why the step is there and what the next one does with it.

A module's meaning includes its integration story: who asks it, and what they do with the answer. A function whose body is obvious and whose callers are unknown has not been understood, so read the call sites as part of reading the module. Vendor detail (a socket close code, a SQL join, an S3 key) is where meaning gets lost; say what it is for, not only what it is.

A long template, such as a SQL string, is a reasonable exception to the small-file rule. The comment ahead of that function says what the template selects or writes, and why it is shaped that way. A comment inside the template marks a join, a filter, or an ordering that the shape does not make obvious.

A comment refers to code by name, a function, a type, a spec, so that a search finds it. It does not cite a commit hash, a line number, or another document with "see …"; those break when the code moves.

A comment must match the code beneath it. One describing a parameter, a branch or a value that is not there is worse than silence, because a reader trusts it and goes looking for what it promised. A comment holding a place for a real one later is the same failure in advance.

Existing commentary is authored. Do not remove it, shorten it, or rewrite it. A comment that reads thin may be carrying a distinction you have not met yet: leave it, and mark it if you must. The remedy for a weak comment is a better comment, never a deleted one. If you cannot state why a step is there, leave a `TODO(misleading)` or `TODO(composition)` mark saying what you could not state rather than guessing.

Two practices get it written, and both apply to every change:

**Write the comment before the code.** State the reason for a step first, then write or change the code so it matches that reason. A step with no reason to introduce does not get introduced, and a comment that stops matching its check shows up at once.

**State the meaning before a file is done.** For each finished file, say what each commented step does for the player, the watcher, or the author, and which rule or policy it serves. The same sentence repeated for every step, or the function's own name written back, means the commentary is not carrying meaning yet.

## Tests

A test should be almost as easy to read as its name. The `it` title states the fact. The body shows that fact and little else: the values this test chose, a comment on each step saying what it writes, and the assertion the title names. Do not start a title with "given" or "should".

Oxlint adds three house rules on top of that:

- The `describe` title is a string, the function name plus the word "function": `describe('toArmy function', ...)`. Do not pass the function.
- Every `it` sets `{ timeout: 5000 }`. A process inject test may use a longer timeout.
- A test body has at most five `expect` calls. `expect.hasAssertions()` counts, and it belongs at the top of the body.

Assert a value this test wrote. Do not assert a default some other helper filled in. The expected value is a literal: one built from the setup's fixture agrees with the fixture instead of checking the code.

Build a game value with factories, sample values, and transforms from `@classicalmoser/prevail-rules`. A fixture in `@testing` does what those cannot: an auth subject, a `DataErrorSignature`, a seat connection, a session store. Do not give two of them the same job. If a rules factory or transform can do it, there is no fixture for it. None of them supplies a value the engine computes, such as the next expected event. Run the function that computes it.

A helper used by one suite may stay in that file. The same helper in a second suite, when no factory or transform covers it, belongs in `@testing`.

Mock ports, not adapters. A use-case test hands the use case a fake `*StoragePort`; it does not stub postgres. An adapter test records the SQL it sends (`@testing` `recordedSql`). HTTP and WebSocket inject tests stay next to composition and interface.

A new spec is written from these rules. The spec in the next file is not the pattern, and an existing spec stays as it is: copying it repeats whatever it already gets wrong.

### Where a test file lives

A `*.test.ts` sits in the same directory as the module it exercises. Its name is that module's file name plus `.test`. `create-vs-bot-game.ts` is tested by `create-vs-bot-game.test.ts` beside it.

Every file that exports a function has that colocated test. A barrel and a type-only module do not.

A test file with no sibling module of the same name is extraneous. Delete it or move the cases next to the function they call.

A case that calls `fanoutEvent` lives in `fanout-event.test.ts`. It does not stay in a parent suite because the parent factory wires `fanoutEvent`. The test calls that function; it does not boot the factory in order to reach it. Do not assert the same fact in a second suite.
