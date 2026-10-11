// "ضيف للتقويم" بعد الحجز: ملف .ics (أي تقويم: iPhone · Outlook) + لينك Google Calendar

type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  location: string;
  startsAt: string; // ISO
  durationMinutes: number;
};

// "2026-10-12T14:30:00.000Z" ← "20261012T143000Z"
const toUtcStamp = (date: Date) =>
  date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');

// الفواصل والسطور الجديدة بتتكتب بشكل خاص جوه الـics
const escapeIcs = (text: string) =>
  text
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/[,;]/g, (char) => `\\${char}`);

function range(event: CalendarEvent) {
  const start = new Date(event.startsAt);
  const end = new Date(start.getTime() + event.durationMinutes * 60_000);
  return { start: toUtcStamp(start), end: toUtcStamp(end) };
}

export function icsContent(event: CalendarEvent): string {
  const { start, end } = range(event);
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Oxygen//Booking//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@oxygen`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(event.description)}`,
    `LOCATION:${escapeIcs(event.location)}`,
    // تذكير قبلها بساعتين
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcs(event.title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function googleCalendarUrl(event: CalendarEvent): string {
  const { start, end } = range(event);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description,
    location: event.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** بينزّل ملف .ics في المتصفح */
export function downloadIcs(event: CalendarEvent, fileName: string) {
  const blob = new Blob([icsContent(event)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export type { CalendarEvent };
