/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBQhFZfS6CmlmcYKTtdo21H0VrCxp7pgjc',
  authDomain: 'aurum-diary-prod.firebaseapp.com',
  projectId: 'aurum-diary-prod',
  storageBucket: 'aurum-diary-prod.firebasestorage.app',
  messagingSenderId: '441444254589',
  appId: '1:441444254589:web:fd4f49567496e8478a8214',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Aurum';
  const body = payload.notification?.body || 'Open Aurum and write a few lines.';
  const link = payload.data?.link || payload.fcmOptions?.link || '/sanctuary/write';

  self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: { link },
    tag: payload.data?.tag || 'aurum-writing-reminder',
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.link || '/sanctuary/write';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(target);
      }
      return undefined;
    })
  );
});
