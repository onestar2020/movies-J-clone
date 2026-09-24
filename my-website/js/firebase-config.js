// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDGVvGPJt95ZHTp9Hm349ouyWemFktbwNY",
  authDomain: "movies-j-stream.firebaseapp.com",
  databaseURL: "https://movies-j-stream-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "movies-j-stream",
  storageBucket: "movies-j-stream.firebasestorage.app",
  messagingSenderId: "1066305700283",
  appId: "1:1066305700283:web:1b94c85927d4b88240789e",
  measurementId: "G-LMWNJG29K4"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

