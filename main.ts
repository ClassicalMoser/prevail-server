import { serve } from '@hono/node-server';
import { app } from './app';
import dotenv from 'dotenv';
import process from 'node:process';

dotenv.config({ path: '.env' });
const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, () => {
  // oxlint-disable-next-line no-console
  console.log(`Listening on http://localhost:${port}`);
});
