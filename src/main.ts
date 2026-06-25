import process from 'node:process';
import { app, configureApp } from '@composition';

const port = Number(process.env.PORT);

const startServer = async (): Promise<void> => {
  await configureApp();
  await app.listen({ port });
  // oxlint-disable-next-line no-console
  console.log(`Server is running on port ${port}.`);
};

await startServer();
