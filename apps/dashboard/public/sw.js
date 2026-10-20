/*
 * Service worker الداشبورد (10.1 · DEC-75): بيخلّي التطبيق يتسطّب ويفتح بسرعة، ومبيخزّنش أي داتا مرضى.
 * - ملفات الـBuild (`/assets/*` بأسماء فيها Hash) وخطوط وأيقونات: بتتخزن وتتقدم من الكاش (مبتتغيرش من غير ما اسمها يتغير).
 * - فتح الصفحات: من النت الأول، ولو مفيش نت بيرجع هيكل التطبيق المخزّن (والشاشة بتقول إن النت مقطوع).
 * - أي طلب API (`/api` أو أي دومين تاني) بيعدّي على النت من غير تخزين. الداتا الطبية مبتتخزنش في الكاش أبدًا.
 */
const VERSION = 'oxygen-staff-v1';
const SHELL = ['/', '/manifest.webmanifest', '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

const isStatic = (url) =>
  url.pathname.startsWith('/assets/') ||
  url.pathname.startsWith('/icons/') ||
  /\.(woff2?|png|webmanifest)$/.test(url.pathname);

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  // API ودومينات تانية وأي طلب غير GET: من غير تخزين
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api')
  )
    return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/').then((cached) => cached ?? Response.error())),
    );
    return;
  }

  if (isStatic(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            const copy = response.clone();
            void caches.open(VERSION).then((cache) => cache.put(request, copy));
            return response;
          }),
      ),
    );
  }
});
