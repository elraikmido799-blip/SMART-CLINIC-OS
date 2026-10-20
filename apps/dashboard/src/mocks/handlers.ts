import { MockHttpError, type MockHandler, type MockHandlers } from '@oxygen/shared';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import { authHandlers, currentStaff } from './auth';
import { billingHandlers } from './billing';
import { clinicHandlers } from './clinic';
import { doctorDayHandlers } from './doctor-day';
import { encounterHandlers } from './encounters';
import { crmHandlers } from './crm';
import { crmActivityHandlers } from './crm-activity';
import { enrollmentHandlers } from './enrollments';
import { exerciseHandlers } from './exercises';
import { formTemplateHandlers } from './form-templates';
import { measurementHandlers } from './measurements';
import { nutritionPlanHandlers } from './nutrition-plans';
import { photoHandlers } from './photos';
import { programHandlers } from './programs';
import { overviewHandlers } from './patient-overview';
import { taskHandlers } from './tasks';
import { readDb } from './db';
import { BRANCHES } from './seed';

/**
 * الداتا الوهمية لحد ما الـAPI يجهز (VITE_API_MOCKING=enabled).
 * المفتاح = اسم الـEndpoint في RTK Query. كل feature ليه ملف هنا بيتجمع تحت.
 * لما الـAPI يجهز: فولدر mocks كله بيتمسح (+ سطر MockTools في components/layout/app-layout.tsx).
 */
const handlers: MockHandlers = {
  ...authHandlers,
  ...clinicHandlers,
  ...billingHandlers,
  ...overviewHandlers,
  ...doctorDayHandlers,
  ...encounterHandlers,
  ...exerciseHandlers,
  ...formTemplateHandlers,
  ...nutritionPlanHandlers,
  ...measurementHandlers,
  ...photoHandlers,
  ...programHandlers,
  ...enrollmentHandlers,
  ...crmHandlers,
  ...crmActivityHandlers,
  ...taskHandlers,
  getBranches: () => {
    const staff = currentStaff();
    const data = staff.all_branches
      ? BRANCHES
      : BRANCHES.filter((branch) => staff.branch_ids.includes(branch.id));
    return { data };
  },
};

// الدخول والفروع مش بيتأثروا بحالة الـAPI، عشان تفضل تقدر تدخل وتتنقل وإنت بتجرّب
const EXEMPT = new Set([
  'getMe',
  'login',
  'verifyTwoFactor',
  'resendTwoFactor',
  'logout',
  'getBranches',
]);

const isRead = (args: FetchArgs) => !args.method || args.method === 'GET';

// "فاضي": أي List بترجع من غير عناصر
function emptied(result: unknown): unknown {
  if (Array.isArray(result)) return [];
  if (result && typeof result === 'object' && Array.isArray((result as { data?: unknown }).data)) {
    return { ...result, data: [] };
  }
  return result;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// حالة الـAPI من أدوات التجربة (mocks/mock-tools.tsx): بنجرّب بيها كل حالات الشاشة
function withScenario(name: string, handler: MockHandler): MockHandler {
  if (EXEMPT.has(name)) return handler;
  return async (args) => {
    const { scenario } = readDb();
    if (scenario === 'error') throw new MockHttpError(500, 'SERVER_ERROR');
    if (scenario === 'slow') await delay(2500);
    const result = await handler(args);
    return scenario === 'empty' && isRead(args) ? emptied(result) : result;
  };
}

export const mockHandlers: MockHandlers = Object.fromEntries(
  Object.entries(handlers).map(([name, handler]) => [name, withScenario(name, handler)]),
);
