// src/js/firebase-init.js

const firebaseConfig = {
  apiKey: "AIzaSyAja-Rzo_5Iwu1iWya9XgioX16WeeBseUQ",
  authDomain: "stickynotesapp-877be.firebaseapp.com",
  databaseURL: "https://stickynotesapp-877be-default-rtdb.firebaseio.com",
  projectId: "stickynotesapp-877be",
  storageBucket: "stickynotesapp-877be.firebasestorage.app",
  messagingSenderId: "350073899895",
  appId: "1:350073899895:web:cacf7443007d4792f46f72",
  measurementId: "G-89BRL2WDNM"
};

firebase.initializeApp(firebaseConfig);

// Make Firebase services available globally
const auth = firebase.auth();
const db = firebase.firestore();

window.auth = auth;
window.db = db;
window.lastGoalId = null;

// Optional: track current user globally
auth.onAuthStateChanged(user => {
  window.currentUser = user || null;
});
