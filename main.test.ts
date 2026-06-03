import { expect, it, describe } from 'vite-plus/test';

import { app } from './app';

describe('get /', () => {
  it('should return 200', { timeout: 10_000 }, async () => {
    expect.hasAssertions();
    const res = await app.request('http://localhost/');
    await expect(res.text()).resolves.toBe('Hello, world!');
  });

  it('should return 404', { timeout: 10_000 }, async () => {
    expect.hasAssertions();
    const res = await app.request('http://localhost/unknown');
    expect(res.status).toBe(404);
  });
});
