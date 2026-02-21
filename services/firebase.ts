
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAN84gTY9ORf3PA_W-y8TlYO93CSLIkF2E",
  authDomain: "verifyemails-8e142.firebaseapp.com",
  projectId: "verifyemails-8e142",
  storageBucket: "verifyemails-8e142.firebasestorage.app",
  messagingSenderId: "1073833011483",
  appId: "1:1073833011483:web:714b291ccefdda4ba80bbe"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
