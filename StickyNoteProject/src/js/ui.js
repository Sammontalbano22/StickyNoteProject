// src/js/ui.js

/**
 * Triggers a confetti animation when a user completes a goal.
 * Uses the canvas-confetti library which must be included via CDN.
 */
function triggerConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
    });
  } else {
    console.warn("⚠️ Confetti library is not loaded.");
  }
}

// Future UI-related helper functions (toast messages, animations, loaders, etc.) can go here.

// Expose to global window object so other scripts can use it
window.triggerConfetti = triggerConfetti;
