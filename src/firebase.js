import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDYt6MuEMKwcX7d_XxQ3HKStP1aSna5KFc",
  authDomain: "attendance-app-76810.firebaseapp.com",
  projectId: "attendance-app-76810",
  storageBucket: "attendance-app-76810.firebasestorage.app",
  messagingSenderId: "234540484956",
  appId: "1:234540484956:web:b24178e85c0f6479849999",
  measurementId: "G-4S2BV4CMS2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);