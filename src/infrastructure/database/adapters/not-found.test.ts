import { notFound } from './not-found';

describe('notFound function', () => {
  it(
    'builds a 404 envelope with the message this test set',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const result = notFound('Army not found');

      expect(result).toStrictEqual({
        message: 'Army not found',
        status: 404,
        success: false,
      });
    },
  );
});
