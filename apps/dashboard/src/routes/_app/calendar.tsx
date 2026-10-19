import { createFileRoute } from '@tanstack/react-router';
import { CalendarPage } from '@/features/calendar/components/calendar-page';
import { validateCalendarSearch } from '@/features/calendar/search';

// الكالندر (D-03 · docs/20 · 3.2)
export const Route = createFileRoute('/_app/calendar')({
  staticData: { nav: 'calendar' },
  validateSearch: validateCalendarSearch,
  component: CalendarPage,
});
