// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { 
  FIREBASE_API_KEY, 
  FIREBASE_AUTH_DOMAIN, 
  FIREBASE_PROJECT_ID, 
  FIREBASE_STORAGE_BUCKET, 
  FIREBASE_MESSAGING_SENDER_ID, 
  FIREBASE_APP_ID, 
  FIREBASE_MEASUREMENT_ID 
} from "@env";
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID
};
// const firebaseConfig = {
//   apiKey: "AIzaSyCh93f5IvE_eUX28egoh9YB_QBZoHDnkqA",
//   authDomain: "goguide-af998.firebaseapp.com",
//   projectId: "goguide-af998",
//   storageBucket: "goguide-af998.firebasestorage.app",
//   messagingSenderId: "550316886551",
//   appId: "1:550316886551:web:cd4367e2b3abcdca2f2a52",
//   measurementId: "G-C4DBPGZSY1"

// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Analytics only works on web
let analytics: any = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export default app;
