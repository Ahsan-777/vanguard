importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBJJUeaJ2PihN6UVRxGuoxBGhsPncoeZ64",
  authDomain: "app3-notifications.firebaseapp.com",
  projectId: "app3-notifications",
  storageBucket: "app3-notifications.firebasestorage.app",
  messagingSenderId: "140633941608",
  appId: "1:140633941608:web:873f5b082a1d895c57bddd"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: '/favicon.ico'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});