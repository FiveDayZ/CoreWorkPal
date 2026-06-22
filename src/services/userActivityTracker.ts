let lastUserActivityAt = Date.now();

const userActivityEvents = [
  "keydown",
  "mousedown",
  "mousemove",
  "pointerdown",
  "pointermove",
  "scroll",
  "touchstart",
] as const;

export function getLastUserActivityAt() {
  return lastUserActivityAt;
}

export function markUserActivity(timestamp = Date.now()) {
  lastUserActivityAt = timestamp;
}

export function registerUserActivityTracking() {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  markUserActivity();

  const handleActivity = () => markUserActivity();
  userActivityEvents.forEach((eventName) => {
    window.addEventListener(eventName, handleActivity, {
      capture: true,
      passive: true,
    });
  });

  return () => {
    userActivityEvents.forEach((eventName) => {
      window.removeEventListener(eventName, handleActivity, { capture: true });
    });
  };
}
