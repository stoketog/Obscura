/**
 * A daily reminder as a calendar event. The player downloads one small .ics file and their own calendar (Apple,
 * Google, Outlook) reminds them every day at the time they chose. No account, no server, works on every phone.
 */
const pad = (n: number) => String(n).padStart(2, '0');

function stamp(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

/** `time` is "HH:MM" in the player's local time; the event repeats daily from the next occurrence. */
export function reminderIcs(time: string, url: string, now: Date = new Date()): string {
  const [h, m] = time.split(':').map(Number);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
  if (start.getTime() <= now.getTime()) start.setDate(start.getDate() + 1);
  const local = `${start.getFullYear()}${pad(start.getMonth() + 1)}${pad(start.getDate())}T${pad(h)}${pad(m)}00`;
  const endD = new Date(start.getTime() + 10 * 60_000);
  const end = `${endD.getFullYear()}${pad(endD.getMonth() + 1)}${pad(endD.getDate())}T${pad(endD.getHours())}${pad(endD.getMinutes())}00`;
  // Floating local times (no zone): the reminder stays at the same clock time wherever the player is.
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Obscura//Daily reminder//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:obscura-daily-${stamp(now)}@obscura`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART:${local}`,
    `DTEND:${end}`,
    'RRULE:FREQ=DAILY',
    'SUMMARY:Obscura: today’s photograph is waiting',
    `DESCRIPTION:Seven prompts\\, one photograph. Can you name it? ${url}`,
    `URL:${url}`,
    'TRANSP:TRANSPARENT',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Today’s Obscura is ready',
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}

export function downloadReminder(time: string): void {
  const url = window.location.origin + '/';
  const blob = new Blob([reminderIcs(time, url)], { type: 'text/calendar;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = 'obscura-daily-reminder.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 4000);
}
