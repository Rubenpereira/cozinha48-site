import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBDb5xaMA_oQMOMHKYqJc7XWe3zDHs8piY",
  authDomain: "cozinha48-d4408.firebaseapp.com",
  projectId: "cozinha48-d4408",
  storageBucket: "cozinha48-d4408.firebasestorage.app",
  messagingSenderId: "600979233685",
  appId: "1:600979233685:web:db7fe3229fbf35e914349c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
