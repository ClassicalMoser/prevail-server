import { sql } from '@infrastructure';

export const createCommandCard = async (
  name: string,
  description: string,
): Promise<void> => {
  await sql`INSERT INTO cards (name, description) VALUES (${name}, ${description})`;
};
