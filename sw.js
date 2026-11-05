// Eldenghost Service Worker – offline-fähig (Cache-first, Versionswechsel räumt alte Caches)
const VERSION = 'eldenghost-v24';
const ASSETS = [
  './', './index.html', './style.css', './manifest.json',
  './js/data.js', './js/platform.js', './js/audio.js', './js/art.js', './js/creatures.js', './js/creatures_dd.js', './js/sprites.js', './js/people.js', './js/tiles.js', './js/ui.js', './js/env.js', './js/stage.js', './js/world.js', './js/battle.js', './js/map.js', './js/main.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png'
];
// v24: Audio-Precache in eigenem Cache, nur im Format, das der Client nutzt (audio.js: OGG, ausser iOS/Safari → MP3).
// Fehlende Audiodateien brechen die Installation nicht; "später" lädt nach "sofort" im Hintergrund.
const AUDIO_CACHE = VERSION + '-audio';
const UA = (self.navigator && navigator.userAgent) || '';
const AUDIO_EXT = /iPhone|iPad|iPod/.test(UA) || (/Safari\//.test(UA) && !/Chrome|Chromium|CriOS|Edg|Android|Firefox/.test(UA)) ? 'mp3' : 'ogg';
const AUDIO_NOW = ['music/ambient', 'music/indoor', 'music/nebel', 'music/battle', 'music/battle_hi',
  'sfx/catch', 'sfx/hit_Elektro', 'sfx/hit_Irrlicht', 'sfx/hit_Kampf', 'sfx/hit_Moor', 'sfx/hit_Nebel', 'sfx/hit_Neutral', 'sfx/hit_Pflanze',
  'sfx/hit_Schatten', 'sfx/hit_Seele', 'sfx/hit_Stein', 'sfx/hit_Wasser', 'sfx/ui_blip', 'sfx/ui_open', 'sfx/ui_tick'];
const AUDIO_LATER = ['music/moor', 'music/cave', 'music/trainer', 'music/boss', 'music/quantum'];
const aUrl = n => './audio/' + n + '.' + AUDIO_EXT;
const cacheEach = (c, list) => Promise.all(list.map(n => c.add(aUrl(n)).catch(() => null)));
function precacheAudio() {
  return caches.open(AUDIO_CACHE).then(c => cacheEach(c, AUDIO_NOW).then(() => cacheEach(c, AUDIO_LATER))).catch(() => null);
}
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => { precacheAudio(); return self.skipWaiting(); }));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== AUDIO_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
