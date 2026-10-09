// كل متغيرات الـenv بتتقرا من هنا بس — اللي محتاج قيمة يستورد `env`
export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? '',
  apiMocking: process.env.NEXT_PUBLIC_API_MOCKING === 'enabled',
  // على السيرفر بس: بيجرّب حالات الأخطاء على الـMocks (fetch-public.ts)
  mockScenario: process.env.MOCK_SCENARIO ?? 'ok',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '',
};
