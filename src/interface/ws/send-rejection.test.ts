import { sendRejection } from './send-rejection';

describe('sendRejection function', () => {
  it('tells a seat its choice did nothing', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const sent: unknown[] = [];
    sendRejection(
      (message) => sent.push(message),
      'choiceRejected',
      'Not your turn',
    );

    expect(sent).toStrictEqual([
      {
        payload: { errorReason: 'Not your turn', result: false },
        type: 'choiceRejected',
      },
    ]);
  });

  it('tells a watcher its step did nothing', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const sent: unknown[] = [];
    sendRejection((message) => sent.push(message), 'stepRejected', 'Game over');

    expect(sent).toStrictEqual([
      {
        payload: { errorReason: 'Game over', result: false },
        type: 'stepRejected',
      },
    ]);
  });
});
