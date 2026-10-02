/**
 * Composite key for one game's event stream in a given round.
 *
 * In-memory stream storage indexes by this string so round N's events stay
 * isolated from round N+1 without nested maps.
 *
 * @param gameId - Game identifier.
 * @param roundNumber - Round whose stream is addressed.
 * @returns `{gameId}:{roundNumber}`.
 */
const streamKey = (gameId: string, roundNumber: number): string => {
  const key = `${gameId}:${roundNumber}`;
  return key;
};

export { streamKey };
