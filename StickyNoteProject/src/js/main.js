// src/js/main.js

window.addEventListener('DOMContentLoaded', () => {
  // Monitor authentication state
  auth.onAuthStateChanged(user => {
    const isLoggedIn = !!user;

    document.getElementById("auth").style.display = isLoggedIn ? "none" : "block";
    document.getElementById("app-content").style.display = isLoggedIn ? "block" : "none";
    document.getElementById("btn-logout").style.display = isLoggedIn ? "inline-block" : "none";

    if (isLoggedIn) {
      loadGoals(); // from milestones.js
    }
  });
});
