# Database

SQL migrations live in [`migrations/`](./migrations).

Apply them in filename order. `0001_baseline.sql` is a schema-only dump of the live database. A later change is a new numbered file, for example `0002_add_example.sql`. Never edit a file after it has been applied.

These files are plain SQL. This repository does not run them with a migration framework.
