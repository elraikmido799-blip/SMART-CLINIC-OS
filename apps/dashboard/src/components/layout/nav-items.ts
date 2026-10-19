import {
  CalendarDays,
  ChartColumn,
  ConciergeBell,
  Contact,
  CreditCard,
  FileText,
  House,
  Leaf,
  Newspaper,
  Package,
  Settings,
  Stethoscope,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import type { Permission } from '@/features/auth/permissions';

/**
 * أقسام الـSidebar (05 §3) بالترتيب. القسم بيظهر لو الموظف عنده صلاحية واحدة من `anyOf` على الأقل
 * (فاضية = للكل). نفس الشرط بيقفل صفحات القسم (routes/_app.tsx).
 */
export const NAV_ITEMS = [
  { key: 'home', to: '/', icon: House, anyOf: [] },
  { key: 'calendar', to: '/calendar', icon: CalendarDays, anyOf: ['appointments.read'] },
  {
    key: 'frontDesk',
    to: '/front-desk',
    icon: ConciergeBell,
    anyOf: ['checkin.write', 'billing.collect'],
  },
  { key: 'patients', to: '/patients', icon: UserRound, anyOf: ['patients.read'] },
  {
    key: 'clinical',
    to: '/clinical',
    icon: Stethoscope,
    anyOf: ['medical.read', 'vitals.write', 'clinical.capture', 'builders.manage'],
  },
  { key: 'programs', to: '/programs', icon: Leaf, anyOf: ['programs.read', 'builders.manage'] },
  { key: 'crm', to: '/crm', icon: Contact, anyOf: ['leads.read', 'leads.create'] },
  { key: 'catalog', to: '/catalog', icon: Package, anyOf: ['catalog.write', 'campaigns.manage'] },
  { key: 'billing', to: '/billing', icon: CreditCard, anyOf: ['billing.read', 'refunds.approve'] },
  {
    key: 'dashboards',
    to: '/dashboards',
    icon: ChartColumn,
    anyOf: ['dashboards.own', 'dashboards.branch', 'dashboards.all'],
  },
  { key: 'reports', to: '/reports', icon: FileText, anyOf: ['reports.export'] },
  { key: 'content', to: '/content', icon: Newspaper, anyOf: ['content.manage'] },
  {
    key: 'settings',
    to: '/settings',
    icon: Settings,
    anyOf: ['settings.read', 'settings.manage', 'staff.manage'],
  },
] as const satisfies readonly {
  key: string;
  to: string;
  icon: LucideIcon;
  anyOf: readonly Permission[];
}[];

export type NavItem = (typeof NAV_ITEMS)[number];
export type NavKey = NavItem['key'];

export const navItem = (key: NavKey): NavItem => NAV_ITEMS.find((item) => item.key === key)!;
