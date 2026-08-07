import type { UserDb } from '../db-types';
import type { User } from '@ports';

const userMapperToDomain = (row: UserDb): User => ({
  userId: row.user_id,
  authSub: row.user_auth_sub,
});

export { userMapperToDomain };
