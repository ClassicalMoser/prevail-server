import { app } from '@composition';

describe('get /', () => {
  it('returns 404 for an unknown path', { timeout: 10_000 }, async () => {
    expect.hasAssertions();
    const res = await app.inject({
      method: 'GET',
      url: 'http://localhost/unknown',
    });
    expect(res.statusCode).toBe(404);
  });
});
