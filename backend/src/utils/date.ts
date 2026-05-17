/**
 * Format a Date as YYYY-MM-DD in Asia/Taipei (UTC+8, no DST).
 *
 * Used for bucketing analytics rows into Taipei calendar days. Doing this with
 * UTC keys causes everything before 08:00 local time to be credited to the
 * previous day, which makes the daily charts misleading for admins viewing them
 * in Taiwan.
 */
export function toTaipeiDayString(d: Date): string {
  return new Date(d.getTime() + 8 * 3600 * 1000).toISOString().slice(0, 10);
}
