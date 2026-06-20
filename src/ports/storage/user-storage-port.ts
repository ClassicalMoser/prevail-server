import type { DataErrorSignature } from '@ports/data-error-signature-port';

/** Domain user entity. Fields will expand when shared contracts land. */
interface User {
  userId: string;
}

interface UserStorage {
  getByUserId: (userId: string) => Promise<DataErrorSignature<User>>;
}

export type { User, UserStorage };
