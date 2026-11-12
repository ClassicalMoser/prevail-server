import { sendRejection } from './send-rejection';

describe('sendRejection function', () => {
  it('tells a seat its choice did nothing', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // The send function records what it is given.
    const sent: unknown[] = [];
    sendRejection(
      (message) => sent.push(message),
      // A seat's frame type for a refused choice.
      'choiceRejected',
      'Not your turn',
    );

    // The seat gets the reason and result: false under that type.
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
    // A watcher's frame type for a refused step.
    sendRejection((message) => sent.push(message), 'stepRejected', 'Game over');

    expect(sent).toStrictEqual([
      {
        payload: { errorReason: 'Game over', result: false },
        type: 'stepRejected',
      },
    ]);
  });
});
