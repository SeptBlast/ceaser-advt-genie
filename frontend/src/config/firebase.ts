import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableNetwork } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "adgenius-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "adgenius-demo",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "adgenius-demo.appspot.com",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);

// Initialize Firestore with specific database
const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || "(default)";
export const db = getFirestore(
  app,
  databaseId !== "(default)" ? databaseId : undefined
);
export const storage = getStorage(app);

// Configure Firestore for production use
try {
  // Enable network to ensure we're not in offline mode
  enableNetwork(db).catch((error) => {
    console.warn("Failed to enable Firestore network:", error);
  });
} catch (error) {
  console.warn("Failed to configure Firestore network:", error);
}

console.log(
  `🔥 Using production Firebase services with database: ${databaseId}`
);

export default app;
