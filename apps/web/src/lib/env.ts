// كل متغيرات الـenv بتتقرا من هنا بس — اللي محتاج قيمة يستورد `env`
export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? '',
  apiMocking: process.env.NEXT_PUBLIC_API_MOCKING === 'enabled',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '',
};
