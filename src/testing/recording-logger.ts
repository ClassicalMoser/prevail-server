import type { LoggerPort } from '@ports';

/** A logger that keeps what it was told, so a test can read it back. */
interface RecordingLogger extends LoggerPort {
  errors: string[];
}

/**
 * Build a logger that records errors instead of printing them.
 *
 * A route test uses it to check that a thrown handler was logged, not just
 * answered. Info and warnings are dropped: no suite asserts on them.
 *
 * @returns A logger and the list its `error` calls append to.
 */
const recordingLogger = (): RecordingLogger => {
  const errors: string[] = [];
  const logger: RecordingLogger = {
    error: (message): void => {
      errors.push(message);
    },
    errors,
    info: (): void => {
      /* Dropped: no suite asserts on info. */
    },
    warn: (): void => {
      /* Dropped: no suite asserts on warnings. */
    },
  };
  return logger;
};

export type { RecordingLogger };
export { recordingLogger };
