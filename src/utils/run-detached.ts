const detachedTasks = new Set<Promise<unknown>>();

/**
 * Starts an async task without awaiting it.
 * Errors are swallowed so sync callers (engine hooks, WS message handlers) stay safe.
 */
const runDetached = (task: () => Promise<unknown>): void => {
  const holder: { current: Promise<unknown> | undefined } = {
    current: undefined,
  };
  holder.current = (async (): Promise<void> => {
    try {
      await task();
    } catch {
      // Detached work must not surface to sync callers.
    } finally {
      if (holder.current !== undefined) {
        detachedTasks.delete(holder.current);
      }
    }
  })();
  detachedTasks.add(holder.current);
};

export { runDetached };
