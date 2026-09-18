import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBJJUeaJ2PihN6UVRxGuoxBGhsPncoeZ64",
  authDomain: "app3-notifications.firebaseapp.com",
  projectId: "app3-notifications",
  storageBucket: "app3-notifications.firebasestorage.app",
  messagingSenderId: "140633941608",
  appId: "1:140633941608:web:873f5b082a1d895c57bddd"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// Request Permission and Get Token
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "BH8VcjOaeQerKxds4AxgcxbdnL9BIbxVSKKOgwCC12gY9u25jeDCggIT1_8R4-xQixl0e_BoaWL_M2-e-vD5rLM"
      });
      console.log("Admin FCM Token:", token);
      return token;
    }
  } catch (error) {
    console.error("Notification permission error:", error);
  }
  return null;
};

// Listen for Foreground Notifications
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });