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
```

Lint is Oxlint. The config is [`oxlint.config.ts`](./oxlint.config.ts), built from `classicalmoser-oxlint-config`, with import boundaries from [`boundaries.ts`](./boundaries.ts) and kebab-case filenames. Format is Oxfmt. In an editor that type-checks as you type and applies fixes on save, a lot of this happens before you notice it. Agents and other setups do not share those defaults. Run `pnpm validate` yourself.

`pnpm validate` is lint, format, and typecheck. Run it often, and before a commit.

`pnpm lint` does not rewrite files. `pnpm fmt` does. A circular import, or an import that names a module which does not exist, has to be fixed by hand.

Rebuild sibling packages (`pnpm build` in `prevail-rules` and `prevail-contracts`) after those change, then typecheck this repo.

## Standards

- [`STYLE.md`](./STYLE.md) — functions, files, commentary, tests
- [`DESIGN.md`](./DESIGN.md) — rules kernel, envelopes, layers
- [`src/README.md`](./src/README.md) — what each layer is for
- [`boundaries.ts`](./boundaries.ts) — which package may import which
- [`docs/adr/README.md`](./docs/adr/README.md) — live-game decisions
