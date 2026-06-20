import type { DataErrorSignature, ErrorSignature } from '@ports';

const isErrorSignature = (
  value: DataErrorSignature<unknown>,
): value is ErrorSignature => value.success === false;

export { isErrorSignature };
