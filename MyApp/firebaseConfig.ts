// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCh93f5IvE_eUX28egoh9YB_QBZoHDnkqA",
  authDomain: "goguide-af998.firebaseapp.com",
  projectId: "goguide-af998",
  storageBucket: "goguide-af998.firebasestorage.app",
  messagingSenderId: "550316886551",
  appId: "1:550316886551:web:cd4367e2b3abcdca2f2a52",
  measurementId: "G-C4DBPGZSY1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export default app;