// src/js/firebase-init.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD3CeTzQhB5HNxJ563unF5rKh0OP-FervI",
  authDomain: "stickynotesapp-877be.firebaseapp.com",
  databaseURL: "https://stickynotesapp-877be-default-rtdb.firebaseio.com",
  projectId: "stickynotesapp-877be",
  storageBucket: "stickynotesapp-877be.appspot.com",
  messagingSenderId: "350073899895",
  appId: "1:350073899895:web:cacf7443007d4792f46f72",
  measurementId: "G-89BRL2WDNM"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
window.auth = auth; // <-- Expose globally for React Auth
window.storage = storage; // Expose storage globally if needed
// ✅ Fallback to ensure global user is always accessible
if (!window.currentUser && auth.currentUser) {
  window.currentUser = auth.currentUser;
}

export { auth, storage };
