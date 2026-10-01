/**
 * Contract-driven route registration.
 *
 * `implement*Route` helpers derive path, auth, method, and request parsing
 * from the contract validators so handlers only wire use-case calls.
 */

import type {
  CreatedPostRoute,
  PostRoute,
} from '@classicalmoser/prevail-contracts';

type PostRouteContract<
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
  TBody,
  TReturn,
> =
  | PostRoute<TParams, TQuery, TBody, TReturn>
  | CreatedPostRoute<TParams, TQuery, TBody, TReturn>;

export type { PostRouteContract };
