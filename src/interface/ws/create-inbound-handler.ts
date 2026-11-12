import type { WsOutcome } from './ws-types';

/**
 * Checks one inbound message's payload and, when it is valid, answers the work
 * to run. `undefined` means the payload failed the contract's schema.
 */
type InboundHandler<TContext, THandle> = (
  payload: unknown,
  context: TContext,
  connectionHandle: THandle,
) => (() => Promise<WsOutcome>) | undefined;

/** The part of a Zod schema this check needs: parse without throwing. */
interface PayloadSchema<TData> {
  safeParse: (
    value: unknown,
  ) => { success: true; data: TData } | { success: false };
}

/**
 * Pair a message's contract schema with the handler call it feeds.
 *
 * The schema check runs now; the handler runs later, off the message loop, so
 * a client cannot reach a use case with a payload the contract refuses.
 *
 * @param input - The contract schema, whether an absent payload means `{}`, and the call.
 * @returns A handler the router can look up by message type.
 */
const createInboundHandler = <TData, TContext, THandle>(input: {
  schema: PayloadSchema<TData>;
  /** A message with no fields (a snapshot request) may omit its payload. */
  emptyPayloadAllowed?: boolean;
  run: (
    data: TData,
    context: TContext,
    connectionHandle: THandle,
  ) => Promise<WsOutcome>;
}): InboundHandler<TContext, THandle> => {
  const handler: InboundHandler<TContext, THandle> = (
    payload,
    context,
    connectionHandle,
  ) => {
    const candidate =
      input.emptyPayloadAllowed === true ? (payload ?? {}) : payload;
    const parsed = input.schema.safeParse(candidate);
    if (!parsed.success) {
      return;
    }
    const work = (): Promise<WsOutcome> =>
      input.run(parsed.data, context, connectionHandle);
    return work;
  };
  return handler;
};

export type { InboundHandler };
export { createInboundHandler };
