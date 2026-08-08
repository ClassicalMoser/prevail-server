import type { DataErrorSignature, LoggerPort, User, UserStorage } from '@ports';
import type { UserDb } from '../db-types';
import { userMapperToDomain } from '../mappers';
import {
  createUserByAuthSubQuery,
  getUserByAuthSubQuery,
  getUserByIdQuery,
} from '../queries';
import type { Sql } from '../sql-type';
import { handleError } from '@utils';

const createUserStorage = (logger: LoggerPort, sql: Sql): UserStorage => ({
  getByUserId: async (userId: string): Promise<DataErrorSignature<User>> => {
    try {
      const rows: UserDb[] = await getUserByIdQuery(sql, userId);
      if (rows.length === 0) {
        return {
          success: false,
          message: 'User not found',
          status: 404,
        };
      }
      return { success: true, data: userMapperToDomain(rows[0]) };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'getting user by id from database',
        message: 'Failed to get user from database',
        status: 500,
      });
    }
  },

  getByAuthSub: async (authSub: string): Promise<DataErrorSignature<User>> => {
    try {
      const rows: UserDb[] = await getUserByAuthSubQuery(sql, authSub);
      if (rows.length === 0) {
        return {
          success: false,
          message: 'User not found',
          status: 404,
        };
      }
      return { success: true, data: userMapperToDomain(rows[0]) };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'getting user by auth sub from database',
        message: 'Failed to get user from database',
        status: 500,
      });
    }
  },

  ensureByAuthSub: async (
    authSub: string,
  ): Promise<DataErrorSignature<User>> => {
    try {
      const existing: UserDb[] = await getUserByAuthSubQuery(sql, authSub);
      if (existing.length > 0) {
        return { success: true, data: userMapperToDomain(existing[0]) };
      }

      try {
        const created: UserDb[] = await createUserByAuthSubQuery(sql, authSub);
        return { success: true, data: userMapperToDomain(created[0]) };
      } catch (insertError) {
        // Concurrent first-login race: another request inserted the same sub.
        const raced: UserDb[] = await getUserByAuthSubQuery(sql, authSub);
        if (raced.length > 0) {
          return { success: true, data: userMapperToDomain(raced[0]) };
        }
        throw insertError;
      }
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'ensuring user by auth sub in database',
        message: 'Failed to ensure user in database',
        status: 500,
      });
    }
  },
});

export { createUserStorage };
