import type { PortResponse } from '@classicalmoser/prevail-rules/application';

const ok = <T>(data: T): PortResponse<T> => {
  const response: PortResponse<T> = { data, result: true };
  return response;
};

const okVoid = (): PortResponse<void> =>
  ({ data: undefined, result: true }) as PortResponse<void>;

const fail = (errorReason: string): PortResponse<never> => {
  const response: PortResponse<never> = {
    errorReason,
    result: false,
  };
  return response;
};

export { fail, ok, okVoid };
