import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// This is the public, client-side config
const firebaseConfig = {
  apiKey: "AIzaSyDzV22OnpFu4hxw_Mg69k5hmVyCnyD_OCU",
  authDomain: "aurum-dev-8361a.firebaseapp.com",
  projectId: "aurum-dev-8361a",
  storageBucket: "aurum-dev-8361a.appspot.com",
  messagingSenderId: "886059164552",
  appId: "1:886059164552:web:e9e52b4a92d5e39b78103d",
  measurementId: "G-E4GZ42RM9T"
};

// Initialize Firebase for the client
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, firebaseConfig };
