import { useEffect, useState } from 'react';
import './App.css';
import '/public/css/main.css';

import Header from './components/header.jsx';
import Auth from './components/auth.jsx';
import StickyNotePad from './components/StickyNotePad.jsx';
import GoalBoard from './components/GoalBoard.jsx';

import { auth } from './js/firebase-init.js';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showWelcomeSticky, setShowWelcomeSticky] = useState(false);
  const [animatedText, setAnimatedText] = useState("");
  const [stickyNotes, setStickyNotes] = useState([]);
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

  // Add a sticky note to the board
  const handleDropNote = (note) => {
    setStickyNotes((prev) => [...prev, note]);
  };

  return (
    <>
      {isLoggedIn && <Header />}
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
        {/* Main app content goes here for logged-in users */}
        {isLoggedIn && !showWelcomeSticky && (
          <div style={{ display: 'flex', flexDirection: 'row', gap: 32, marginTop: 24, justifyContent: 'center', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontFamily: 'Patrick Hand, Comic Sans MS, cursive', color: '#4d2600', marginBottom: 8 }}>Sticky Note Pad</h2>
              <StickyNotePad onCreate={handleDropNote} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'Patrick Hand, Comic Sans MS, cursive', color: '#4d2600', marginBottom: 8 }}>Goal Board</h2>
              <GoalBoard notes={stickyNotes} onDropNote={handleDropNote} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
