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
import { auth } from './js/firebase-init.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showWelcomeSticky, setShowWelcomeSticky] = useState(false);
  const [animatedText, setAnimatedText] = useState("");
  const stickyMessage = "I am Accomplishing my Goals!";

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setShowWelcomeSticky(true);
        setAnimatedText("");
        let i = 0;
        const interval = setInterval(() => {
          setAnimatedText(stickyMessage.slice(0, i + 1));
          i++;
          if (i === stickyMessage.length) {
            clearInterval(interval);
          }
        }, 1800 / stickyMessage.length); // slightly slower writing
        setTimeout(() => {
          setShowWelcomeSticky(false);
          setIsLoggedIn(true);
        }, 2300); // longer delay so full sentence is visible
      } else {
        setIsLoggedIn(false);
        setShowWelcomeSticky(false);
        setAnimatedText("");
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="App">
      {showWelcomeSticky && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#ffe082',
            border: '2.5px dashed #f4a261',
            borderRadius: '18px 14px 16px 12px/12px 16px 14px 18px',
            boxShadow: '0 8px 32px #f4a26155, 0 2px 0 #fffbe8 inset',
            width: 320, height: 320,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Patrick Hand, Comic Sans MS, cursive, sans-serif',
            fontWeight: 900, fontSize: '1.5em', color: '#4d2600',
            textAlign: 'center',
            animation: 'pop-in 0.5s cubic-bezier(.4,2,.6,.9)',
            whiteSpace: 'pre-line',
          }}>
            {animatedText}
          </div>
          <style>{`@keyframes pop-in {0%{transform:scale(0.7) rotate(-6deg);opacity:0;} 60%{transform:scale(1.08) rotate(2deg);opacity:1;} 100%{transform:scale(1) rotate(0deg);opacity:1;}}`}</style>
        </div>
      )}
      {!isLoggedIn && !showWelcomeSticky && <Auth />}
      {isLoggedIn && !showWelcomeSticky && <Header />}
      {isLoggedIn && !showWelcomeSticky && (
        <button
          id="btn-logout"
          style={{ margin: '1em', display: 'inline-block' }}
          onClick={() => signOut(auth)}
        >
          🚪 Sign Out
        </button>
      )}
      <div id="app-content" style={{ display: isLoggedIn && !showWelcomeSticky ? 'block' : 'none' }}>
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
