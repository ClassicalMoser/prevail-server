import type { DataErrorSignature } from '@ports';

/**
 * Build a void data success for writes that return no payload.
 *
 * @returns `{ success: true, data: undefined }`.
 */
const voidSuccess = (): DataErrorSignature<void> => ({
  success: true,
  data: undefined,
});

export { voidSuccess };
