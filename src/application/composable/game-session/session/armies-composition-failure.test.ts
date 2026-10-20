import { army, miniArmy, whiteArmyId } from '@testing';
import { armiesCompositionFailure } from './armies-composition-failure';

describe('armiesCompositionFailure function', () => {
  it(
    'returns undefined when both armies match the mode',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const failure = armiesCompositionFailure(
        miniArmy(whiteArmyId),
        miniArmy(whiteArmyId),
        'mini',
      );

      expect(failure).toBeUndefined();
    },
  );

  it(
    'names the white army when its list fails the mode',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const failure = armiesCompositionFailure(
        army(whiteArmyId),
        miniArmy(whiteArmyId),
        'mini',
      );

      expect(failure).toMatchObject({
        message: expect.stringContaining('White army'),
        status: 400,
        success: false,
      });
    },
  );
});
