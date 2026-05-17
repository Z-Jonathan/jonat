import { differenceInSeconds } from 'date-fns';

export type Urgency = 'expired' | 'urgent' | 'soon' | 'normal';

const TWO_HOURS = 2 * 60 * 60;
const ONE_DAY = 24 * 60 * 60;

export function secondsUntil(expiresAt: string, now: Date): number {
  return differenceInSeconds(new Date(expiresAt), now);
}

// Drives the time-pressure visual language: red < 2h, amber < 24h.
export function getUrgency(expiresAt: string, now: Date): Urgency {
  const s = secondsUntil(expiresAt, now);
  if (s <= 0) return 'expired';
  if (s < TWO_HOURS) return 'urgent';
  if (s < ONE_DAY) return 'soon';
  return 'normal';
}

// Compact, glanceable countdown: "<1m left" / "45m left" / "3h 20m left" /
// "2d 4h left".
export function formatTimeLeft(expiresAt: string, now: Date): string {
  const total = secondsUntil(expiresAt, now);
  if (total <= 0) return 'Expired';

  const minutes = Math.floor(total / 60);
  if (minutes < 1) return '<1m left';
  if (minutes < 60) return `${minutes}m left`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const m = minutes % 60;
    return m > 0 ? `${hours}h ${m}m left` : `${hours}h left`;
  }

  const days = Math.floor(hours / 24);
  const h = hours % 24;
  return h > 0 ? `${days}d ${h}h left` : `${days}d left`;
}
