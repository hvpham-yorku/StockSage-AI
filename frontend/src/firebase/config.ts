// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC0cM6h4Lf9DLfH1FINyBH8pyTBHJsxF08",
  authDomain: "stock-trading-simulator-test.firebaseapp.com",
  databaseURL: "https://stock-trading-simulator-test-default-rtdb.firebaseio.com",
  projectId: "stock-trading-simulator-test",
  storageBucket: "stock-trading-simulator-test.firebasestorage.app",
  messagingSenderId: "445015986110",
  appId: "1:445015986110:web:f1c87e7c5ba9accab8f3ef",
  measurementId: "G-ZQ6M8H2H6J"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Only log in client-side environments to prevent hydration mismatches
if (typeof window !== 'undefined') {
  console.log("Firebase connected!");
  // Initialize analytics only on client side
  const getAnalytics = () => import('firebase/analytics').then(({ getAnalytics }) => getAnalytics(app));
  getAnalytics();
}

//Only for local emulator
// connectAuthEmulator(auth, "http://127.0.0.1:9099");
// connectFirestoreEmulator(db, "127.0.0.1", 8080);