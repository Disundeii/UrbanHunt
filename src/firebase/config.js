// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAgLJffH9LRWHFK284xUgC22-GR20NzPEo",
  authDomain: "wildcard-f9087.firebaseapp.com",
  databaseURL: "https://wildcard-f9087-default-rtdb.firebaseio.com",
  projectId: "wildcard-f9087",
  storageBucket: "wildcard-f9087.firebasestorage.app",
  messagingSenderId: "773539207120",
  appId: "1:773539207120:web:d3c049774c49348a390bd5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Realtime Database (for presence tracking)
export const realtimeDb = getDatabase(app);

export default app;

