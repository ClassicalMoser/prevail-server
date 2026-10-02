import type { Event } from '@classicalmoser/prevail-rules/domain';
import { createInMemoryEventStreamStorage } from './in-memory-event-stream-storage';

const choiceEvent = {
  choiceType: 'doneIssuingCommands',
  eventNumber: 0,
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
      const created = await storage.newEventStream('game-1', 1);
      const appended = await storage.addEventToStream('game-1', 1, choiceEvent);
      const loaded = await storage.getEventStream('game-1', 1);

      expect(created).toStrictEqual({ data: [], result: true });
      expect(appended).toStrictEqual({ data: [choiceEvent], result: true });
      expect(loaded).toStrictEqual({ data: [choiceEvent], result: true });
    },
  );

  it(
    'fails append when the stream was never created',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const storage = createInMemoryEventStreamStorage({});
      const appended = await storage.addEventToStream('game-1', 1, choiceEvent);

      expect(appended).toStrictEqual({
        errorReason: 'Event stream not initialized',
        result: false,
      });
    },
  );
});
