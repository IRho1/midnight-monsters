// Offline support: keeps the game on the phone after the first visit. New versions load when online.
const CACHE = "stitched-ec6a73d0c34a";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const keep = (r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return r; };
  if (url.origin === location.origin) {
    e.respondWith(fetch(req).then(keep).catch(() => caches.match(req).then((r) => r || caches.match("./index.html"))));
  } else if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then(keep)));
  }
});
