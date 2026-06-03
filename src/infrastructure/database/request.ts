import { sql } from './sql';

const dbRequest = async (): Promise<void> => {
  const result = await sql`SELECT version()`;
  // oxlint-disable-next-line no-console
  console.log(result);
};

export { dbRequest };
