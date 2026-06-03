import { Hono } from 'hono';
import { dbRequest, sql } from '@infrastructure';

const app = new Hono();

app.get('/', (c) => c.text('Hello, world!'));
app.get('/db', async (): Promise<void> => {
  await dbRequest();
});
app.get('/health', async (c) => {
  const result = await sql`SELECT current_database(), version()`;
  return c.json(result[0]);
});

export { app };
