import type { PlayerSide } from '@classicalmoser/prevail-rules/domain';

/** The seat that is not `side`. White's other side is black. */
const otherSide = (side: PlayerSide): PlayerSide => {
  const opposite: PlayerSide = side === 'white' ? 'black' : 'white';
  return opposite;
};

export { otherSide };
