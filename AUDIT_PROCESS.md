# Audit process

An audit brings code back in line with the standards in this repo. It runs on one scope at a time, on the same branch, one scope ahead of the human read. This is the process [`prevail-rules`](../prevail-rules/AUDIT_PROCESS.md) uses, adapted to a server.

The read is for comprehension: the author understands the scope well enough to change it unaided. The scout pass exists to make that reading cheap. Everything below serves that, and a step that does not is noise.

The machine scouts. It makes the scope readable, fixes what is obviously wrong, and leaves what it must not touch marked where it stands.

## Criteria

- [`STYLE.md`](./STYLE.md) — functions, files, commentary, tests
- [`DESIGN.md`](./DESIGN.md) — rules kernel, envelopes, live games
- [`LAYERS.md`](./LAYERS.md) — what each layer is for
- [`boundaries.ts`](./boundaries.ts) — which package may import which

Those docs own the rules. This one owns the workflow.

## Scope order

Dependency order: domain, ports, application, infrastructure, interface, composition. A module is read after what it imports; comprehension does not run downhill. Within a layer, take one directory at a time.

Two things to check before opening a scope:

- Do the module names describe what the server does for someone, or a path through a type? A scope whose only statable reasons are plumbing is a design finding; mark it rather than grinding.
- How many twins does it hold? Two modules that differ by a side, a seat-versus-watcher, or a label are the most common finding in this repo. Compare them line by line before reading either.

## The scout pass

### Before starting

- Take one scope: a directory, or a diff.
- Record `pnpm test` and `pnpm validate` at the start. A failure already there is not the audit's.
- Commit before the read reaches the scope. The read is of history, not of a working tree.

### Commentary

Commentary is the point of the pass.

**Never overwrite.** An existing comment is an authored definition of meaning. Do not remove it, shorten it, or rewrite it. Where it looks wrong, leave it and mark it.

Where a comment is missing, write one. It will be clarified later; absent is worse than approximate.

What is usually thin is in-body commentary. Add the line that says why the step is there: what it does for the player, the watcher, or the author, and which rule or policy it serves. A comment must match the check the code makes.

### Marks

Anything the pass must not change itself is marked where it stands:

- `TODO(wrong)` — looks incorrect, and the right behaviour is in question
- `TODO(misleading)` — a name, comment, or title that says the wrong thing
- `TODO(composition)` — duplication, logic in the wrong layer, a shape that repeats

A mark names what is wrong and what would settle it. Marks in the files are the report the human reads. An entry in the assessment may index a finding; it does not replace the mark.

### What it may change

**Tests.** Compose setup from rules factories, transforms and `@testing`. Extract a helper used by a second suite into `@testing`. Delete a duplicate helper. Rewrite a title that states no fact. Move a case to the suite of the function it calls. Setup only: an assertion's expected value stays a literal.

A spec that reads as authored, a title that states a real fact, a comment explaining why a case exists, gets marked, not rewritten. List any case dropped or merged.

**Structure, without changing behaviour.**

- Split a file so that it has one primary export. Each spec moves with it.
- Lift the bodies out of a factory closure into named functions of their own.
- Collapse a twin into one function with a parameter, when the two agree on every branch, message, and status. Where they differ, mark the difference; do not pick one.
- Name an intermediate. `return` stands on its own line and returns that name.
- Move a function to the layer that owns it, as `LAYERS.md` describes.
- Do not refile a directory onto a different axis without the author.

### What it may fix

A fix is allowed when the code is obviously wrong. All of these hold:

- The code contradicts its own comment, its type, a test, or a rule in the docs.
- The right behaviour is not in question.
- The fix is small, and it changes no route shape, socket message, or status a client reads.

A fix gets a failing spec first, and its own commit.

### What it leaves alone

Any change to a contract's shape. Any change to a status, a message a client reads, a close code, a call order, or a return value that is not an allowed fix. A possible bug that could be a design decision. Replacing an ad-hoc definition in production code with a shared helper when the two may differ.

Those get a mark, not a change.

### Commits

One kind per commit, in this order where they apply:

1. Refiling and splits
2. Commentary and marks
3. Specs
4. Fixes, one per commit

A commentary commit stays free of behaviour changes; a fix commit is the only place a behaviour change belongs.

### Before finishing

Run `pnpm test` and `pnpm validate` on the whole repo, not only the scope. A failure that was not there at the start is the audit's to explain.

If a rewritten spec fails, stop. Name the assertion and the value it now provides. Do not change production code to make it pass unless that is an allowed fix.

## The human read

Read by file. Open each module in the scope and read it where it stands: source, colocated spec, and the marks in those files.

Read the file for what it does. Then write the line the machine could not: why the module exists, in terms a reader outside this code would follow.

Decide each mark in the file. A mark closes as a fix, a comment worth keeping, or a deletion.

Set a time limit for a file that will not open. When it runs out, write the specific question you cannot answer in the assessment, and move on.
