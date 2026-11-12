# Agents

Read all of the linked documents before starting work, and follow them.

## The point of this project

This is the server for a board game. It hosts live games, stores the cards and armies players build, and renders cards. The goal of the codebase is that a reader who knows Prevail but has never seen this code can follow why a module exists: what it does for a player at a seat, a watcher, or an army builder, and which rule or policy it serves. The game's rules live in `prevail-rules`; what this repo holds is how those rules reach people.

Models rarely comment enough, and never do without prompting. [`STYLE.md`](./STYLE.md) says what a comment must carry and what a test must state. Read it before writing either.

- [`README.md`](./README.md) — What the server does, and how to run it
- [`STYLE.md`](./STYLE.md) — Rules for how code is written
- [`DESIGN.md`](./DESIGN.md) — Rules for how code is organized, and how live games work
- [`LAYERS.md`](./LAYERS.md) — What each layer is for
- [`boundaries.ts`](./boundaries.ts) — Enforced dependency directions
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — Rules for workflows; run `pnpm validate` often and before a commit
- [`AUDIT_PROCESS.md`](./AUDIT_PROCESS.md) — Rules for running an audit
- [`ASSESSMENT-2026-11-11.md`](./ASSESSMENT-2026-11-11.md) — What is known to be open

Do not edit `prevail-rules` or `prevail-contracts` as part of a server change. Those are sibling packages.
