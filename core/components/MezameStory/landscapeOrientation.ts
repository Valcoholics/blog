type OrientationController = {
  lock?: (orientation: 'landscape') => Promise<void>;
  unlock: () => void;
};

export function createLandscapeOrientation() {
  let current: { orientation: OrientationController } | null = null;
  const unlock = (orientation: OrientationController) => {
    try { orientation.unlock(); } catch { /* Native fullscreen remains usable. */ }
  };
  return {
    async request(orientation?: OrientationController) {
      if (!orientation?.lock) return;
      const request = { orientation };
      current = request;
      try {
        await orientation.lock('landscape');
        // An exit may arrive before the asynchronous lock finishes.
        if (current !== request && !current) unlock(orientation);
      } catch {
        if (current === request) current = null;
        // Unsupported rotation must not prevent watching in fullscreen.
      }
    },
    release() {
      const request = current;
      current = null;
      if (request) unlock(request.orientation);
    },
  };
}
