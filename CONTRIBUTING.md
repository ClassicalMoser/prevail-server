# Contributing

## Checks

Use the scripts in `package.json`. Do not call `vitest`, `tsc`, `oxlint`, or `oxfmt` directly.

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm lint
pnpm fmt
pnpm validate
pnpm check:commentary
```

Lint is Oxlint. The config is [`oxlint.config.ts`](./oxlint.config.ts), built from `classicalmoser-oxlint-config`, with import boundaries from [`boundaries.ts`](./boundaries.ts) and kebab-case filenames. Format is Oxfmt. In an editor that type-checks as you type and applies fixes on save, a lot of this happens before you notice it. Agents and other setups do not share those defaults. Run `pnpm validate` yourself.

`pnpm validate` is lint, format, and typecheck (the source and `scripts/`). Run it often, and before a commit.

`pnpm check:commentary` reports in-body commentary density per layer, source and tests apart. It cannot fail, and it is not a target to hit: padding a body raises the number and makes the file worse. Run it to see where a layer stands before and after working on it.

`pnpm lint` does not rewrite files. `pnpm fmt` does. A circular import, or an import that names a module which does not exist, has to be fixed by hand.

Rebuild sibling packages (`pnpm build` in `prevail-rules` and `prevail-contracts`) after those change, then typecheck this repo.

## Changing behaviour

A change to what the server does starts with a spec that fails, in its own commit, and then the fix in the next. A change to a route's shape, a socket message, or a status a client reads is a contracts change first; describe it and ask before writing either.

Before deleting a function nothing calls, find who should be calling it: a caller-less function is usually the twin of a hand-rolled copy elsewhere.

## Commits

One kind of change per commit. Subjects follow [Conventional Commits](https://www.conventionalcommits.org): a type, an optional scope in parentheses, an optional `!` for a breaking change, then a colon, a space and a description. The types are `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. A subject has at most one scope.

## Standards

- [`STYLE.md`](./STYLE.md) — functions, files, commentary, tests
- [`DESIGN.md`](./DESIGN.md) — rules kernel, envelopes, live games
- [`LAYERS.md`](./LAYERS.md) — what each layer is for
- [`boundaries.ts`](./boundaries.ts) — which package may import which
- [`AUDIT_PROCESS.md`](./AUDIT_PROCESS.md) — bringing a scope back in line
