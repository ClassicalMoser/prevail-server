/** One `users` row: local id and the Auth0 subject it stands for. */
interface UserDb {
  user_id: string;
  user_auth_sub: string;
}

export type { UserDb };
