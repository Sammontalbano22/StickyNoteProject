import React, { useState, useEffect } from 'react';
import './App.css';
import '/public/css/main.css';
import { Routes, Route } from 'react-router-dom';

import Header from './components/header.jsx';
import Auth from './components/auth.jsx';
import Profile from './components/profile.jsx';
import Journal from './components/journal.jsx';
import Achievements from './components/Achievements.jsx';

function App() {
  const [user, setUser] = useState(null);

  // Update profile handler (could be extended to backend)
  const handleProfileUpdate = updated => {
    setUser(prev => ({ ...prev, ...updated }));
  };

  useEffect(() => {
    // Listen for auth changes (if using Firebase Auth)
    if (window.auth && window.auth.onAuthStateChanged) {
      window.auth.onAuthStateChanged(u => setUser(u));
    }
    // Optionally, set user from global if available
    if (window.currentUser) setUser(window.currentUser);
  }, []);

  return (
    <div className="App">
      <Header user={user} />
      {/* Sign Out button for dashboard */}
      {user && (
        <button
          style={{
            position: 'fixed',
            top: '1.2rem',
            right: '1.2rem',
            zIndex: 1000,
            background: '#e57373',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.7rem 1.4rem',
            fontSize: '1.1rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px #ffe06655',
            transition: 'background 0.15s, transform 0.13s',
          }}
          onClick={async () => {
            if (window.auth && window.auth.signOut) {
              await window.auth.signOut();
              setUser(null);
            }
          }}
        >
          🚪 Sign Out
        </button>
      )}
      <Routes>
        <Route path="/" element={
          !user ? (
            <Auth />
          ) : (
            <>
              <Profile user={user} onProfileUpdate={handleProfileUpdate} />
              <div id="app-content">
                <main>
                  {/* Goal Creation */}
                  <section id="goal-creator">
                    <h2>Write a New Goal</h2>
                    <div className="note-pad">
                      <textarea id="goal-input" placeholder="Write your sticky goal here..."></textarea>
                    </div>
                    <button onClick={() => window.addGoal?.()}>📌 Pin Goal</button>
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

                  {/* Journal */}
                  <Journal />
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
                    <button onClick={() => window.addMilestone?.()}>Add</button>
                  </section>

                  {/* Counselor */}
                  <section id="counselor">
                    <h2>👩‍🏫 Progress Counselor</h2>
                    <div id="counselor-message">Welcome! Let’s keep moving forward 💪</div>
                  </section>
                </main>
              </div>
            </>
          )
        } />
        <Route path="/achievements" element={<Achievements />} />
      </Routes>
    </div>
  );
}

export default App;
