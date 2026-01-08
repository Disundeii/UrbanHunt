// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAgLJffH9LRWHFK284xUgC22-GR20NzPEo",
  authDomain: "wildcard-f9087.firebaseapp.com",
  projectId: "wildcard-f9087",
  storageBucket: "wildcard-f9087.firebasestorage.app",
  messagingSenderId: "773539207120",
  appId: "1:773539207120:web:d3c049774c49348a390bd5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;

