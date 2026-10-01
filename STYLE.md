# Style

Code shape for this repository. Layer roles are in [`src/README.md`](./src/README.md). Import edges are in [`boundaries.ts`](./boundaries.ts): a package imports only the aliases that file allows.

This is the same shape as [`prevail-rules` `STYLE.md`](../prevail-rules/STYLE.md). Differences that belong to this repo are called out below.

## Shape

Small functions, small files. One primary export per file. A function does one job. A name says what that job is.

A barrel (`index.ts`) re-exports those files. It is not a second implementation. A factory and the deps type it closes over may share a file. Two functions with different jobs do not.

Functions should not turn into skyscrapers. If nested functions or `if` bodies exceed ten lines or so, they should usually split out. The name says what that branch does.

No classes. Shared behavior is a function, or a closure that returns functions.

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

Filenames are **kebab-case**. Oxlint enforces that. The rules package uses camelCase for domain identifiers. This server does not.

## TypeScript and Zod

The project is strict about both. Do not use a type assertion (`as`, `!`) or `@ts-ignore`. The exception is a test that must pass a value the type forbids, and only in a `*.test.ts` file, with a comment on that line saying why.

Two production edges still assert, because the type cannot say the value:

- `PortResponse<void>` does not accept a literal `undefined`. `port-response.ts` returns that response with one assertion.
- Rules `Game` and `GameState` are visibility unions. Storing an authoritative game, loading one back, and writing `createInitialGameState` onto that game still narrow with an assertion. Those lines are `in-memory-game-storage.ts`, `load-authoritative-game.ts`, and `create-vs-bot-game.ts`.

`schema.parse` throws on an invalid command-card write. That is the insert's failure, described in [`DESIGN.md`](./DESIGN.md).

Do not add another assertion. If a cast is only hiding a type that can be written, write the type. Vendor values (S3 status, Fastify query, Typst stdout, Auth0 permissions, socket handles, parsed JSON) are narrowed with checks, not assertions.

## Commentary

Commentary is extensive. **More than 25% is not too much. Less than 10% is usually not enough to infer intent cleanly.**

An exported function has a JSDoc block ahead of it: what it writes, and why. Leave `@param` and `@returns` in place. A shorter header is not a cleanup. When a function does several steps, comment each step the same way. A one-line constant that the rest of the system depends on says why that value exists.

A long template, such as a SQL string, is a reasonable exception to the small-file rule. The template can run past a short function. Intent is still easy to lose inside it. The comment ahead of that function says what the template selects or writes, and why it is shaped that way. A comment inside the template marks a join, a filter, or an ordering that the shape does not make obvious.

## Tests

A test should be almost as easy to read as its name. The `it` title states the fact. The body shows that fact and little else. Do not start a title with "given" or "should".

Oxlint adds three house rules on top of that:

- The `describe` title is a string, and it is not the imported function's name. Use `describe('armyDisplayName function', ...)`.
- Every `it` sets `{ timeout: 5000 }`. A process inject test may use a longer timeout.
- A test body has at most five `expect` calls. `expect.hasAssertions()` counts, and it belongs at the top of the body.

Assert a value this test wrote. Do not assert a default some other helper filled in.

Build a game value with factories, sample values, and transforms from `@classicalmoser/prevail-rules`. A fixture in this repo does what those cannot: an auth subject, a `DataErrorSignature`, a seat connection. Do not give two of them the same job. If a rules factory or transform can do it, there is no fixture for it.

A helper used by one suite may stay in that file. The same helper in a second suite, when no factory or transform covers it, belongs in `@testing`.

### Where a test file lives

A `*.test.ts` sits in the same directory as the module it exercises. Its name is that module's file name plus `.test`. `create-vs-bot-game.ts` is tested by `create-vs-bot-game.test.ts` beside it.

Every file that exports a function has that colocated test. A barrel and a type-only module do not.

A test file with no sibling module of the same name is extraneous. Delete it or move the cases next to the function they call.

A case that calls `fanoutEvent` lives in `fanout-event.test.ts`. It does not stay in a parent suite because the parent factory wires `fanoutEvent`. If the case is already in a parent file, move it. If the module has no test, write one. The new test calls that function. It does not boot the factory in order to reach it. Do not assert the same fact in a second suite.

Mock ports, not adapters. HTTP inject tests stay next to composition and interface.
