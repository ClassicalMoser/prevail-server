import { withSubject } from './with-subject';

describe('withSubject function', () => {
  it(
    'hands the handler the verified subject and the request',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The handler echoes its two arguments so the test sees what it was
      // given.
      const handler = withSubject(
        async (subject: string, request: { id: string }) => [
          subject,
          request.id,
        ],
      );

      await expect(
        // A verified caller: the subject and the request both reach the
        // handler.
        handler({ id: 'army-1' }, { subject: 'auth0|a' }),
      ).resolves.toStrictEqual(['auth0|a', 'army-1']);
    },
  );

  it(
    'answers 401 without calling the handler when nobody is signed in',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // A spy standing for a use case.
      const run =
        vi.fn<(subject: string, request: object) => Promise<string>>();
      const handler = withSubject(run);

      // No auth at all.
      await expect(handler({}, undefined)).resolves.toStrictEqual({
        message: 'Unauthorized',
        status: 401,
        success: false,
      });
      // The use case never ran: an unauthenticated caller must not reach it.
      expect(run).not.toHaveBeenCalled();
    },
  );
});
