import {
  CalendarDays,
  FileHeart,
  FolderOpen,
  House,
  ListChecks,
  Package,
  ReceiptText,
  UserRound,
} from 'lucide-react';

// أقسام البوابة (PP-01 → PP-08). الاسم = المفتاح في messages (portal.nav.*)
export const PORTAL_NAV = [
  { key: 'overview', href: '/portal', icon: House },
  { key: 'appointments', href: '/portal/appointments', icon: CalendarDays },
  { key: 'passport', href: '/portal/passport', icon: FileHeart },
  { key: 'documents', href: '/portal/documents', icon: FolderOpen },
  { key: 'plans', href: '/portal/plans', icon: ListChecks },
  { key: 'packages', href: '/portal/packages', icon: Package },
  { key: 'invoices', href: '/portal/invoices', icon: ReceiptText },
  { key: 'profile', href: '/portal/profile', icon: UserRound },
] as const;

// على الموبايل: 4 تحت + "المزيد" (الباقي في Sheet)
export const MOBILE_PRIMARY = ['overview', 'appointments', 'passport', 'documents'] as const;

export const isActive = (pathname: string, href: string) =>
  href === '/portal' ? pathname === '/portal' : pathname.startsWith(href);
