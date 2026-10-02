import type { PortResponse } from '@classicalmoser/prevail-rules/application';

/**
 * Wrap a value in a successful rules port response.
 *
 * @param data - Payload the port returns to the rules kernel.
 * @returns A `PortResponse` with `result: true`.
 */
const ok = <T>(data: T): PortResponse<T> => {
  const response: PortResponse<T> = { data, result: true };
  return response;
};

/**
 * Successful void port response.
 *
 * `PortResponse<void>` does not accept a literal `undefined` in the type, so
 * this file is the STYLE-listed production assertion for that shape.
 *
 * @returns A void success response for ports that only acknowledge.
 */
const okVoid = (): PortResponse<void> =>
  ({ data: undefined, result: true }) as PortResponse<void>;

/**
 * Wrap a failure reason in a rules port response.
 *
 * @param errorReason - Human-readable reason the port rejected the call.
 * @returns A `PortResponse` with `result: false`.
 */
const fail = (errorReason: string): PortResponse<never> => {
  const response: PortResponse<never> = {
    errorReason,
    result: false,
  };
  return response;
};

export { fail, ok, okVoid };
