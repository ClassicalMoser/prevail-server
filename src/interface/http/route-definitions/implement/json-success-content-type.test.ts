import { jsonSuccessContentType } from './json-success-content-type';

describe('jsonSuccessContentType constant', () => {
  it('is application/json', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(jsonSuccessContentType).toBe('application/json');
  });
});
