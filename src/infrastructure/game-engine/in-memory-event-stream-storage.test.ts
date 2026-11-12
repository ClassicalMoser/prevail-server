import type { Event } from '@classicalmoser/prevail-rules/domain';
import { createInMemoryEventStreamStorage } from './in-memory-event-stream-storage';

// One small player-choice event; the storage never reads its contents.
const choiceEvent = {
  choiceType: 'doneIssuingCommands',
  eventType: 'playerChoice',
  player: 'white',
} as Event; // narrow fixture; Event is a large domain union

describe('createInMemoryEventStreamStorage function', () => {
  it(
    'creates, appends, and reads events for one round stream',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const storage = createInMemoryEventStreamStorage({});
      // Create the stream for game-1 round 1, append one event, then read it
      // back.
      const created = await storage.newEventStream('game-1', 1);
      const appended = await storage.addEventToStream('game-1', 1, choiceEvent);
      const loaded = await storage.getEventStream('game-1', 1);

      // A new stream starts empty.
      expect(created).toStrictEqual({ data: [], result: true });
      // Appending returns the stream including the new event.
      expect(appended).toStrictEqual({ data: [choiceEvent], result: true });
      // A later read returns the same events: the stream is stored per game and
      // round.
      expect(loaded).toStrictEqual({ data: [choiceEvent], result: true });
    },
  );

  it(
    'fails append when the stream was never created',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const storage = createInMemoryEventStreamStorage({});
      // No newEventStream was called for this round.
      const appended = await storage.addEventToStream('game-1', 1, choiceEvent);

      // An event can only be added to a stream the engine started, so a missing
      // stream fails rather than creating one.
      expect(appended).toStrictEqual({
        errorReason: 'Event stream not initialized',
        result: false,
      });
    },
  );
});
