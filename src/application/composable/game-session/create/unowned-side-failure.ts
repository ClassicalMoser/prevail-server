import type { ErrorSignature } from '@ports';

/**
 * The envelope a bot-vs-bot create answers when one side's army cannot be loaded.
 *
 * A missing army is the creator's mistake, so it is a 400 naming the side to
 * fix, not a 404: the route exists, the body is wrong. Any other storage
 * failure is not the creator's doing and keeps its status.
 *
 * @param failure - The owned-army port's failure.
 * @param sideLabel - Which side's army id it was.
 * @returns The envelope create should return.
 */
const unownedSideFailure = (
  failure: ErrorSignature,
  sideLabel: 'White' | 'Black',
): ErrorSignature => {
  if (failure.status === 404) {
    const missing: ErrorSignature = {
      message: `${sideLabel} army must be an army owned by the creating player`,
      status: 400,
      success: false,
    };
    return missing;
  }
  const other: ErrorSignature = {
    message: 'Army could not be loaded',
    status: failure.status,
    success: false,
  };
  return other;
};

export { unownedSideFailure };
