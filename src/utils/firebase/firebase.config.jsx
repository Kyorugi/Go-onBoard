import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// import { firebaseConfig } from "./firebase.config";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_APP_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_FIREBASE_APP_ID,

  // apiKey: "AIzaSyDSwyqMv3nf_knUcjTpZ4tahlcglsPviDQ",
  //   authDomain: "onboarding-6610f.firebaseapp.com",
  //   projectId: "onboarding-6610f",
  //   storageBucket: "onboarding-6610f.appspot.com",
  //   messagingSenderId: "775454494556",
  //   appId: "1:775454494556:web:e007c9e79bd84f43577b99",
};

const app = initializeApp(firebaseConfig);
export const database = getFirestore();
export const auth = getAuth(app);
