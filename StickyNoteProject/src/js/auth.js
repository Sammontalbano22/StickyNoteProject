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
function initAuthFlow() {
  const emailInput    = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const btnLogin      = document.getElementById('btn-login');
  const btnSignup     = document.getElementById('btn-signup');
  let btnLogout       = document.getElementById('btn-logout');
  const authStatus    = document.getElementById('auth-status');
  const stickyNote    = document.getElementById('sticky-note-anim');
  const fakeEmail     = 'you@domain.com';
  let idx             = 0;
  let typingTimer;

  if (!emailInput || !btnLogin || !stickyNote) {
    console.warn("❌ Required DOM elements not found");
    return;
  }

  // Clear the auto-typed email when user clicks the email input
  emailInput.addEventListener('focus', () => {
    if (emailInput.value === fakeEmail) {
      emailInput.value = '';
    }
    emailInput.classList.remove('handwriting', 'caret');
    clearTyping();
  });

  // -------- Helpers --------

  function clearTyping() {
    clearTimeout(typingTimer);
  }

  function startAutoType() {
    clearTyping();
    emailInput.value      = '';
    emailInput.readOnly   = true;
    btnLogin.disabled     = true;
    emailInput.classList.add('handwriting', 'caret');
    idx = 0;
    (function typeEmail() {
      emailInput.value += fakeEmail[idx++];
      if (idx < fakeEmail.length) {
        typingTimer = setTimeout(typeEmail, 150);
      } else {
        emailInput.classList.remove('caret');
        emailInput.readOnly = false;
        btnLogin.disabled   = false;
      }
    })();
  }

  function resetSticky() {
    // restore to initial corner state
    stickyNote.style.display = 'block';
    stickyNote.classList.remove('to-center', 'dragging');
    stickyNote.textContent = '';
    stickyNote.contentEditable = 'false';
    // remove any inline positioning so CSS absolute top/right takes over
    stickyNote.style.position = '';
    stickyNote.style.top = '';
    stickyNote.style.left = '';
    stickyNote.style.transform = '';
  }

  // -------- Easter‐egg: drag & write --------

  // enable writing on double-click
  stickyNote.addEventListener('dblclick', () => {
    stickyNote.contentEditable = 'true';
    stickyNote.focus();
  });

  // drag support
  let isDragging = false;
  let dragOffsetX = 0, dragOffsetY = 0;
  let dragStartX = 0, dragStartY = 0;
  let mouseMoveHandler, mouseUpHandler;
  stickyNote.addEventListener('mousedown', e => {
    if (e.target !== stickyNote) return;
    isDragging = true;
    stickyNote.classList.add('dragging');
    const rect = stickyNote.getBoundingClientRect();
    stickyNote.style.position = 'fixed';
    // Immediately move sticky note to cursor position
    dragOffsetX = rect.width / 2;
    dragOffsetY = rect.height / 2;
    dragStartX = rect.left;
    dragStartY = rect.top;
    stickyNote.style.left = `${e.clientX - dragOffsetX}px`;
    stickyNote.style.top = `${e.clientY - dragOffsetY}px`;
    stickyNote.style.transform = 'none';
    document.body.style.userSelect = 'none';

    mouseMoveHandler = function(e) {
      if (!isDragging) return;
      const newLeft = e.clientX - dragOffsetX;
      const newTop  = e.clientY - dragOffsetY;
      stickyNote.style.left = `${newLeft}px`;
      stickyNote.style.top  = `${newTop}px`;
      // Calculate distance from original position
      const dx = newLeft - dragStartX;
      const dy = newTop - dragStartY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > 100) {
        stickyNote.classList.add('to-center');
      } else {
        stickyNote.classList.remove('to-center');
      }
    };
    mouseUpHandler = function() {
      if (isDragging) {
        isDragging = false;
        stickyNote.classList.remove('dragging');
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
        if (!stickyNote.classList.contains('to-center')) {
          resetSticky();
        }
      }
    };
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  });

  // -------- Main flow --------

  resetSticky();
  startAutoType();

  btnLogin.addEventListener('click', e => {
    e.preventDefault();
    authStatus.textContent = '';

    // move sticky note to center
    stickyNote.classList.remove('to-center');
    void stickyNote.offsetWidth;
    stickyNote.classList.add('to-center');

    // after transition, handwrite + login
    setTimeout(() => {
      const message = 'I Am achieving my goals';
      let i = 0;
      stickyNote.textContent = '';
      stickyNote.classList.add('handwriting', 'caret');

      (function write() {
        stickyNote.textContent += message[i++];
        if (i < message.length) {
          setTimeout(write, 150);
        } else {
          stickyNote.classList.remove('caret');
          signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
            .then(() => {
              emailInput.value    = '';
              passwordInput.value = '';
            })
            .catch(err => {
              authStatus.textContent = `❌ ${err.message}`;
            });
        }
      })();
    }, 600);
  });

  btnSignup?.addEventListener('click', async e => {
    e.preventDefault();
    authStatus.textContent = '';
    const email = emailInput.value;
    const pw    = passwordInput.value;
    if (pw.length < 6) {
      authStatus.textContent = '❌ Password must be at least 6 characters';
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, pw);
      authStatus.textContent = '✅ Signed up';
      passwordInput.value = '';
      resetSticky();
      startAutoType();
    } catch (err) {
      authStatus.textContent = `❌ ${err.message}`;
    }
  });

  // If the logout button doesn't exist, create and append it
  if (!btnLogout) {
    btnLogout = document.createElement('button');
    btnLogout.id = 'btn-logout';
    btnLogout.textContent = 'Sign Out';
    btnLogout.style.display = 'none';
    btnLogout.style.position = 'fixed';
    btnLogout.style.top = '1rem';
    btnLogout.style.right = '1rem';
    btnLogout.style.zIndex = 1000;
    document.body.appendChild(btnLogout);
  }

  btnLogout.addEventListener('click', () => {
    signOut(auth).then(() => {
      window.location.reload();
    });
  });

  onAuthStateChanged(auth, user => {
    const isLoggedIn  = !!user;
    const authSection = document.getElementById('auth-section');
    const authDiv     = document.getElementById('auth');
    const appContent  = document.getElementById('app-content');

    if (authSection) authSection.style.display = isLoggedIn ? 'none' : 'flex';
    if (authDiv)     authDiv.style.display     = isLoggedIn ? 'none' : 'block';
    if (appContent)  appContent.style.display  = isLoggedIn ? 'block' : 'none';
    if (btnLogout)   btnLogout.style.display  = isLoggedIn ? 'inline-block' : 'none';

    if (!isLoggedIn) {
      // reset UI after logout
      clearTyping();
      startAutoType();
      resetSticky();
      authStatus.textContent = '';
      passwordInput.value    = '';
    } else {
      setTimeout(() => loadGoals(), 100);
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuthFlow);
} else {
  initAuthFlow();
}
