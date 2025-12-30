// 電子雞 Service Worker - 支援離線遊戲
const CACHE_NAME = 'tamagotchi-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/fonts/PressStart2P-Regular.ttf',
  '/js/app.js',
  '/js/game.js',
  '/js/pet.js',
  '/js/minigame.js',
  '/js/storage.js',
  '/manifest.json',
  '/assets/icon-192.png',
  '/assets/icon-512.png'
];

// 安裝 Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('快取已開啟');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('快取失敗:', error);
      })
  );
  // 跳過等待，立即啟用
  self.skipWaiting();
});

// 啟用 Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('刪除舊快取:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 接管所有頁面
  self.clients.claim();
});

// 攔截請求，優先使用快取
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 快取命中，返回快取內容
        if (response) {
          return response;
        }
        // 快取未命中，發送網路請求
        return fetch(event.request).then((response) => {
          // 確保是有效回應
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          // 複製回應並加入快取
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      })
      .catch(() => {
        // 離線時返回快取的首頁
        return caches.match('/index.html');
      })
  );
});
