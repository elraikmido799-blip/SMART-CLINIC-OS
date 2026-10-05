// كل متغيرات الـenv بتتقرا من هنا بس — اللي محتاج قيمة يستورد `env`
export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? '',
  apiMocking: import.meta.env.VITE_API_MOCKING === 'enabled',
};
