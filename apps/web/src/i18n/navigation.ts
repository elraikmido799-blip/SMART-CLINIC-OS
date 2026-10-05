import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// استخدم Link و useRouter من هنا (مش من next) عشان اللغة تفضل في الـURL
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
