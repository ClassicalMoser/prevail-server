import { sql } from './sql';

const dbRequest = async (): Promise<unknown> => {
  const result = await sql`SELECT version()`;
  return result;
};

export { dbRequest };
