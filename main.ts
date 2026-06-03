// Import { serve } from '@hono/node-server';
// Import { app } from './app';
import { serve } from '@hono/node-server';
import process from 'node:process';
import { app } from './app';

const port = Number(process.env.PORT);

const startServer = (): void => {
  // oxlint-disable-next-line no-console
  console.log(`Server is running on port ${port}.`);
  // oxlint-disable-next-line no-console
  console.log(`Listening to some good tunes on http://localhost:${port}`);

  serve({ fetch: app.fetch, port }, () => {
    // oxlint-disable-next-line no-console
    console.log(`Server is running on port ${port}.`);
    // oxlint-disable-next-line no-console
    console.log(`Listening on http://localhost:${port}`);
  });
};

startServer();
