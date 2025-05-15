// src/js/auth.js

const btnSignup = document.getElementById('btn-signup');
const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');
const authStatus = document.getElementById('auth-status');

// Sign up a new user
async function signupUser() {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  if (passwordInput.value.length < 6) {
    authStatus.textContent = '❌ Password must be at least 6 characters';
    return;
  }

  try {
    await auth.createUserWithEmailAndPassword(emailInput.value, passwordInput.value);
    authStatus.textContent = '';
    emailInput.value = '';
    passwordInput.value = '';
  } catch (e) {
    authStatus.textContent = `❌ ${e.message}`;
  }
}

// Log in an existing user
async function loginUser() {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  try {
    await auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value);
    authStatus.textContent = '';
    emailInput.value = '';
    passwordInput.value = '';
  } catch (e) {
    authStatus.textContent = `❌ ${e.message}`;
  }
}

// Log out the current user
function logoutUser() {
  auth.signOut();
}

// Attach event listeners safely
if (btnSignup) btnSignup.addEventListener('click', signupUser);
if (btnLogin) btnLogin.addEventListener('click', loginUser);
if (btnLogout) btnLogout.addEventListener('click', logoutUser);

// Auth state change handler
auth.onAuthStateChanged(user => {
  const isLoggedIn = !!user;
  document.getElementById("auth").style.display = isLoggedIn ? "none" : "block";
  document.getElementById("app-content").style.display = isLoggedIn ? "block" : "none";
  btnLogout.style.display = isLoggedIn ? "inline-block" : "none";

  window.currentUser = user || null;

  if (isLoggedIn && typeof loadGoals === "function") {
    loadGoals();
  }
});

// Expose functions globally
window.signupUser = signupUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
