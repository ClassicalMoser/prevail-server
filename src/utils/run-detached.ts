const detachedTasks = new Set<Promise<unknown>>();

/**
 * Starts an async task without awaiting it.
 * Errors are swallowed so sync callers (engine hooks, WS message handlers) stay safe.
 */
const runDetached = (task: () => Promise<unknown>): void => {
  const holder: { current: Promise<unknown> | undefined } = {
    current: undefined,
  };
  // The task starts now but nothing awaits it: used where a synchronous caller (an
  // engine hook, a socket message handler) must not wait or throw.
  holder.current = (async (): Promise<void> => {
    try {
      await task();
    } catch {
      // Detached work must not surface to sync callers.
    } finally {
      // Forget the task once it settles so the set holds only unfinished work.
      if (holder.current !== undefined) {
        detachedTasks.delete(holder.current);
      }
    }
  })();
  detachedTasks.add(holder.current);
};

export { runDetached };
