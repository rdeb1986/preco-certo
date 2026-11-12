// Guarda a "casca" do app para abrir rápido. Os preços sempre vêm da internet.
const VERSAO = 'v2';
const ARQUIVOS = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // preços: sempre direto da rede
  // tenta a rede primeiro (pega atualizações); se estiver sem internet, usa o guardado
  // 'no-cache' = sempre confere com o servidor se há versão nova antes de usar a guardada
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(r => {
    const copia = r.clone(); caches.open(VERSAO).then(c => c.put(e.request, copia)); return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match('./'))));
});
