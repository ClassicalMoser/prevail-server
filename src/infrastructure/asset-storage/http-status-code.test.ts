import { httpStatusCode } from './http-status-code';

describe('httpStatusCode function', () => {
  it(
    'reads httpStatusCode from an AWS-shaped $metadata object',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const status = httpStatusCode({
        $metadata: { httpStatusCode: 404 },
      });

      expect(status).toBe(404);
    },
  );

  it('returns undefined when metadata is missing', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const status = httpStatusCode(new Error('network'));

    expect(status).toBeUndefined();
  });
});
