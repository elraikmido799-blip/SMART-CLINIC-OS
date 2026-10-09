import { notFound } from 'next/navigation';

// أي مسار مش معروف تحت /en أو /ar بيروح لـnot-found.tsx بتاع اللغة (بلغة الزائر)
export default function CatchAllPage() {
  notFound();
}
