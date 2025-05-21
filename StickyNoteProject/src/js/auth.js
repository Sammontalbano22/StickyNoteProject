// src/js/auth.js
import { auth } from './firebase-init.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

import { loadGoals } from './milestones.js';

console.log("✅ auth.js loaded");

setTimeout(() => {
  console.log("⏳ Waiting for DOM to be ready...");

  const btnSignup = document.getElementById('btn-signup');
  const btnLogin = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');
  const authStatus = document.getElementById('auth-status');

  if (!btnLogin || !btnSignup) {
    console.warn("❌ Login or Signup buttons not found in DOM")
    return;
  }

  btnSignup.addEventListener('click', async () => {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    if (passwordInput.value.length < 6) {
      authStatus.textContent = '❌ Password must be at least 6 characters';
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
      authStatus.textContent = '✅ Signed up';
      emailInput.value = '';
      passwordInput.value = '';
    } catch (e) {
      authStatus.textContent = `❌ ${e.message}`;
    }
  });

  btnLogin.addEventListener('click', async () => {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    try {
      await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
      authStatus.textContent = '✅ Logged in';
      emailInput.value = '';
      passwordInput.value = '';
    } catch (e) {
      authStatus.textContent = `❌ ${e.message}`;
    }
  });

  btnLogout?.addEventListener('click', () => {
    signOut(auth).catch((e) => {
      console.error("❌ Logout error:", e.message);
    });
  });

  onAuthStateChanged(auth, (user) => {
    const isLoggedIn = !!user;

    document.getElementById("auth").style.display = isLoggedIn ? "none" : "block";
    document.getElementById("app-content").style.display = isLoggedIn ? "block" : "none";
    if (btnLogout) btnLogout.style.display = isLoggedIn ? "inline-block" : "none";

    window.currentUser = user || null;

    if (isLoggedIn) {
      console.log("✅ Auth state confirmed. Waiting for currentUser token...");
      setTimeout(() => {
        loadGoals();
      }, 100);
    }
  });
}, 0);
