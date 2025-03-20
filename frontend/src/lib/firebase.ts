'use client';

// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // TODO: Replace with your Firebase config
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Check if we're running on the client side
const isBrowser = typeof window !== 'undefined';

// Initialize Firebase
let app: FirebaseApp | undefined;
let auth: Auth | undefined;

if (isBrowser) {
  try {
    // Check if any required config values are missing
    const requiredConfigs = ['apiKey', 'authDomain', 'projectId', 'databaseURL'];
    const missingConfigs = requiredConfigs.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);
    
    if (missingConfigs.length > 0) {
      console.error(`Missing required Firebase config values: ${missingConfigs.join(', ')}`);
      console.error('Please update your .env.local file with the correct Firebase configuration.');
    } else {
      // Initialize Firebase
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      console.log("Firebase initialized successfully");
    }
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
} else {
  console.log("Firebase initialization skipped on server side");
}

export { app, auth }; 