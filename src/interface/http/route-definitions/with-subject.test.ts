import { withSubject } from './with-subject';

describe('withSubject function', () => {
  it(
    'hands the handler the verified subject and the request',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const handler = withSubject(
        async (subject: string, request: { id: string }) => [
          subject,
          request.id,
        ],
      );

      await expect(
        handler({ id: 'army-1' }, { subject: 'auth0|a' }),
      ).resolves.toStrictEqual(['auth0|a', 'army-1']);
    },
  );

  it(
    'answers 401 without calling the handler when nobody is signed in',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const run =
        vi.fn<(subject: string, request: object) => Promise<string>>();
      const handler = withSubject(run);

      await expect(handler({}, undefined)).resolves.toStrictEqual({
        message: 'Unauthorized',
        status: 401,
        success: false,
      });
      expect(run).not.toHaveBeenCalled();
    },
  );
});
