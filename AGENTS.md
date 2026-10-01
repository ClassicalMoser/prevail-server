# Agents

Read the human docs and follow them. This file is only a pointer.

- [`STYLE.md`](./STYLE.md) — functions, files, commentary, tests
- [`DESIGN.md`](./DESIGN.md) — rules kernel, envelopes, layers
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — package scripts; run `pnpm validate` often and before a commit
- [`src/README.md`](./src/README.md) — what each layer is for
- [`boundaries.ts`](./boundaries.ts) — which package may import which
- [`docs/adr/README.md`](./docs/adr/README.md) — live-game decisions

Do not edit `prevail-rules` or `prevail-contracts` as part of a server change. Those are sibling packages.
