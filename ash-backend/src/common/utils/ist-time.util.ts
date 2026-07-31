/**
 * Formats a Date as a 24-hour "HH:mm" string in the India (Asia/Kolkata)
 * timezone, no matter what timezone the server OS itself is running in.
 *
 * Previously the app used `now.toTimeString()`, which reads the SERVER's
 * local timezone. On servers provisioned with UTC as the OS timezone this
 * produced a time that was ~5.5 hours behind the real IST time (e.g. a
 * challan created at 10:01 PM IST was stamped "16:31"). Explicitly
 * targeting "Asia/Kolkata" here makes the result correct regardless of
 * the underlying server's configured timezone.
 *
 * Kept in 24-hour "HH:mm" form because this is the exact format the
 * native <input type="time"> in the Edit Challan dialog requires; the
 * 12-hour AM/PM display happens only at render time on the receipt (see
 * `formatTime12h` on the frontend).
 */
export function formatIstTime24h(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);
}
