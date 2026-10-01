const streamKey = (gameId: string, roundNumber: number): string => {
  const key = `${gameId}:${roundNumber}`;
  return key;
};

export { streamKey };
