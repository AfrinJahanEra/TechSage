// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAnZWtNEqeaAIxYJFRGOMM1WsFwmxSh9K4",
  authDomain: "techsage-ridika.firebaseapp.com",
  projectId: "techsage-ridika",
  storageBucket: "techsage-ridika.firebasestorage.app",
  messagingSenderId: "980567230959",
  appId: "1:980567230959:web:019b5ef32db5ae2144ce1a",
  measurementId: "G-V5MS791ZFX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Setup Google provider
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };

