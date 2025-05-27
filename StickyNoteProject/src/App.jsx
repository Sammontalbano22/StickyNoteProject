import { useEffect, useState } from 'react';
import './App.css';
import '/public/css/main.css';

import Header from './components/header.jsx';
import Auth from './components/auth.jsx';
import Journal from './components/journal.jsx';

import {
  addGoal,
  loadGoals,
  addMilestone,
  renderMilestone,
  updateGoalProgress,
  displayAISteps,
  loadCardBack
} from './js/milestones.js';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Dynamically load auth.js AFTER the DOM is rendered by React
    const script = document.createElement('script');
    script.src = '/src/js/auth.js'; // Adjust path if different
    script.type = 'module';
    document.body.appendChild(script);

    // Listen for auth state changes
    const checkAuth = setInterval(() => {
      const user = window.currentUser;
      setIsLoggedIn(!!user);
    }, 300);

    return () => {
      document.body.removeChild(script);
      clearInterval(checkAuth);
    };
  }, []);

  return (
    <div className="App">
      {isLoggedIn && <Header />}
      <Auth />

      {/* Sign Out button for main page */}
      {isLoggedIn && (
        <button
          id="btn-logout"
          style={{ margin: '1em', display: 'inline-block' }}
          onClick={() => {
            // Use Firebase signOut directly
            import('./js/firebase-init.js').then(({ auth }) => {
              import('firebase/auth').then(({ signOut }) => {
                signOut(auth);
              });
            });
          }}
        >
          🚪 Sign Out
        </button>
      )}

      <div id="app-content" style={{ display: isLoggedIn ? 'block' : 'none' }}>
        <main>
          {/* Goal Creation */}
          <section id="goal-creator">
            <h2>Write a New Goal</h2>
            <div className="note-pad">
              <textarea id="goal-input" placeholder="Write your sticky goal here..."></textarea>
            </div>
            <button onClick={addGoal}>📌 Pin Goal</button>
          </section>

          {/* Goal Display */}
          <section id="goal-board">
            <h2>Pinned Goals</h2>
            <div id="sticky-board"></div>
          </section>

          {/* AI Suggestions */}
          <section id="suggestions">
            <h2>AI Suggested Steps</h2>
            <div id="suggested-goals"></div>
          </section>

          {/* Daily Reflection (handled inside Journal.jsx) */}
          <Journal />

          {/* Journal View Button and Section */}
          <button onClick={() => window.loadJournal?.()}>📖 View Journal</button>
          <div id="journal-section"></div>

          {/* Milestones */}
          <section id="milestones">
            <h2>Milestone Tracker</h2>
            <ul id="milestone-list"></ul>

            <label htmlFor="milestone-goal-select">Attach to goal:</label>
            <select id="milestone-goal-select">
              <option value="">-- Select a goal --</option>
            </select>

            <input id="milestone-input" placeholder="Add milestone..." />
            <button onClick={addMilestone}>Add</button>
          </section>

          {/* Counselor Message */}
          <section id="counselor">
            <h2>👩‍🏫 Progress Counselor</h2>
            <div id="counselor-message">Welcome! Let’s keep moving forward 💪</div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
