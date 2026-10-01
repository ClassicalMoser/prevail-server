# Style

Code shape for this repository. Layer roles are in [`src/README.md`](./src/README.md). Import edges are in [`boundaries.ts`](./boundaries.ts): a package imports only the aliases that file allows.

This is the same shape as [`prevail-rules` `STYLE.md`](../prevail-rules/STYLE.md). Differences that belong to this repo are called out below.

## Shape

Small functions, small files. One primary export per file. A function does one job. A name says what that job is.

A barrel (`index.ts`) re-exports those files. It is not a second implementation. A factory and the deps type it closes over may share a file. Two functions with different jobs do not.

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

- `PortResponse<void>` does not accept a literal `undefined`. The in-memory engine helper returns that response with one assertion.
- Rules `Game` and `GameState` are visibility unions. Storing an authoritative game in memory, and writing `createInitialGameState` onto that game, still narrows with an assertion. That happens in the in-memory adapter and in `game-session-use-cases.ts`.

`schema.parse` throws on an invalid command-card write. That is the insert's failure, described in [`DESIGN.md`](./DESIGN.md).

Do not add another assertion. If a cast is only hiding a type that can be written, write the type. Vendor values (S3 status, Fastify query, Typst stdout, Auth0 permissions, socket handles, parsed JSON) are narrowed with checks, not assertions.

## Commentary

Commentary is extensive. 25% comments is not too much. Leave existing function commentary in place, including `@param` and `@returns`. JSDoc-style comments ahead of declarations are good for IDE readability. A shorter header is not a cleanup. When a helper does several steps, comment each step: what it writes, and why.

## Tests

A test should be almost as easy to read as its name. The `it` title states the fact. The body shows that fact and little else. Do not start a title with "given" or "should".

Oxlint adds three house rules on top of that:

- The `describe` title is a string, and it is not the imported function's name. Use `describe('armyDisplayName function', ...)`.
- Every `it` sets `{ timeout: 5000 }`. A process inject test may use a longer timeout.
- A test body has at most five `expect` calls. `expect.hasAssertions()` counts, and it belongs at the top of the body.

Assert a value this test wrote. Do not assert a default some other helper filled in.

Build a game value with factories, sample values, and transforms from `@classicalmoser/prevail-rules`. A fixture in this repo does what those cannot: an auth subject, a `DataErrorSignature`, a seat connection. Do not give two of them the same job. If a rules factory or transform can do it, there is no fixture for it.

A helper used by one suite may stay in that file. The same helper in a second suite, when no factory or transform covers it, belongs in `@testing`.

Colocate `*.test.ts` with the module it exercises. Mock ports, not adapters. HTTP inject tests stay next to composition and interface.
