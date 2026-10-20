/**
 * تسجيل الـservice worker (10.1 · DEC-75): في الـBuild بس (مش في `pnpm dev` عشان مايكاشيش ملفات التطوير).
 * لو المتصفح مش بيدعمه أو التسجيل فشل، التطبيق بيشتغل عادي من غير تسطيب.
 */
export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // مفيش حاجة تتعمل: التسطيب اختياري
    });
  });
}
