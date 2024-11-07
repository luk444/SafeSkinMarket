// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDVHzA2YdC3R6m26pf3NPAAXM5FZc0ufgo",
  authDomain: "safetrade-e92e1.firebaseapp.com",
  projectId: "safetrade-e92e1",
  storageBucket: "safetrade-e92e1.appspot.com",
  messagingSenderId: "45805042182",
  appId: "1:45805042182:web:a9bc47d7ab15db7c9d2187",
  measurementId: "G-KL76R9QJXV",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, setDoc, doc };
