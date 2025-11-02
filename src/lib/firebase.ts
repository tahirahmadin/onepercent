import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAKcJ_OPZqgFP-b1TFFXiUHayZbycfTyxI",
  authDomain: "onepercent-app-new.firebaseapp.com",
  projectId: "onepercent-app-new",
  storageBucket: "onepercent-app-new.firebasestorage.app",
  messagingSenderId: "745194387237",
  appId: "1:745194387237:web:da19ac413ae4faa06b8ccc",
  measurementId: "G-F0Z5QF8QCB"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
