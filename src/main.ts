import process from 'node:process';
import { app } from '@composition';

const port = Number(process.env.PORT);

const startServer = (): void => {
  app.listen({ port }, () => {
    // oxlint-disable-next-line no-console
    console.log(`Server is running on port ${port}.`);
  });
};

startServer();
