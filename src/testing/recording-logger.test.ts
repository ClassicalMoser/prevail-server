import { recordingLogger } from './recording-logger';

describe('recordingLogger function', () => {
  it('keeps each error it is told', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const logger = recordingLogger();
    logger.error('first');
    logger.error('second');

    expect(logger.errors).toStrictEqual(['first', 'second']);
  });
});
