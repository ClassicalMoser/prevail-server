import { recordingLogger } from './recording-logger';

describe('recordingLogger function', () => {
  it('keeps each error it is told', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const logger = recordingLogger();
    // Two errors are logged in order.
    logger.error('first');
    logger.error('second');

    // Both are kept, in order, so a test can assert on what was logged.
    expect(logger.errors).toStrictEqual(['first', 'second']);
  });
});
