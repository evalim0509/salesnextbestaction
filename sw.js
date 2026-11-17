/* Nudge offline support. Caches the app's own files only; your data never passes through here. */
var CACHE = 'nudge-v8';
var FILES = ['./', 'index.html', 'css/style.css', 'js/i18n-pairs.js', 'js/i18n.js', 'js/engine.js', 'js/parsers.js', 'js/dashboard.js', 'js/export.js', 'js/app.js',
  'vendor/xlsx.full.min.js', 'vendor/jszip.min.js', 'vendor/pptxgen.min.js', 'vendor/jspdf.umd.min.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png',
  'sample-data/sample_transactions.xlsx', 'sample-data/sample_account_plans.docx', 'sample-data/sample_campaign_deck.pptx'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
// Network first so updates arrive; fall back to the cached copy when there is no signal.
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(function (r) {
    if (r && r.ok) { var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); }
    return r;
  }).catch(function () { return caches.match(e.request, { ignoreSearch: true }).then(function (m) { return m || caches.match('index.html'); }); }));
});
