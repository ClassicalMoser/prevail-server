import type { EventStreamStorage } from '@classicalmoser/prevail-rules/application';
import type { Event } from '@classicalmoser/prevail-rules/domain';
import type { InMemoryEnginePortHooks } from './in-memory-engine-port-hooks';
import { fail, ok, okVoid } from './port-response';
import { streamKey } from './stream-key';

const createInMemoryEventStreamStorage = (
  hooks: InMemoryEnginePortHooks,
): EventStreamStorage => {
  const streams = new Map<string, Event[]>();

  return {
    getEventStream: async (gameId, roundNumber) => {
      const stream = streams.get(streamKey(gameId, roundNumber));
      const response = ok(stream);
      return response;
    },
    addEventToStream: async (gameId, roundNumber, event) => {
      const key = streamKey(gameId, roundNumber);
      const current = streams.get(key);
      if (current === undefined) {
        const response = fail('Event stream not initialized');
        return response;
      }
      const next = [...current, event];
      streams.set(key, next);
      hooks.onEventAppended?.(gameId, roundNumber, event);
      const response = ok(next);
      return response;
    },
    flushEventStream: async (gameId, roundNumber) => {
      streams.delete(streamKey(gameId, roundNumber));
      const response = okVoid();
      return response;
    },
    newEventStream: async (gameId, roundNumber) => {
      const key = streamKey(gameId, roundNumber);
      if (streams.has(key)) {
        const response = fail('Event stream already exists');
        return response;
      }
      const empty: Event[] = [];
      streams.set(key, empty);
      const response = ok(empty);
      return response;
    },
    truncateEventStream: async (gameId, roundNumber, firstEventToRemove) => {
      const key = streamKey(gameId, roundNumber);
      const current = streams.get(key);
      if (current === undefined) {
        const response = fail('Event stream not initialized');
        return response;
      }
      const next = current.slice(0, firstEventToRemove);
      streams.set(key, next);
      const response = ok(next);
      return response;
    },
  };
};

export { createInMemoryEventStreamStorage };
