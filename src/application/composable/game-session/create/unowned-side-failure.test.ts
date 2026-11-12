import { unownedSideFailure } from './unowned-side-failure';

const failure = (
  status: number,
): { success: false; message: string; status: number } => ({
  message: 'storage said so',
  status,
  success: false,
});

describe('unownedSideFailure function', () => {
  it(
    'answers 400 naming the side when the army is not found',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      expect(unownedSideFailure(failure(404), 'Black')).toStrictEqual({
        message: 'Black army must be an army owned by the creating player',
        status: 400,
        success: false,
      });
    },
  );

  it(
    'keeps the status of a failure that is not a missing army',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      expect(unownedSideFailure(failure(503), 'White')).toStrictEqual({
        message: 'Army could not be loaded',
        status: 503,
        success: false,
      });
    },
  );
});
