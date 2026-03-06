import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyATJiKfbdrcqS3YdVBC3__orqzGu7geZL8",
  authDomain: "nexus-ge.firebaseapp.com",
  projectId: "nexus-ge",
  storageBucket: "nexus-ge.firebasestorage.app",
  messagingSenderId: "733619399481",
  appId: "1:733619399481:web:ed22d48658189c742896e8"
};

const app = initializeApp(firebaseConfig);
export const db      = getFirestore(app);
export const storage = getStorage(app);
export const auth    = getAuth(app);