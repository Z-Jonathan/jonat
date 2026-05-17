import { useEffect, useState } from 'react';

// One ticking clock, lifted to the screen and passed down, so a long feed
// doesn't spawn a timer per card. Default cadence: once a minute.
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
