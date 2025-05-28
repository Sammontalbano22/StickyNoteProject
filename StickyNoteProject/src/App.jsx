import { useEffect, useState } from 'react';
import './App.css';
import '/public/css/main.css';

import Header from './components/header.jsx';
import Auth from './components/auth.jsx';
import StickyNotePad from './components/StickyNotePad.jsx';
import GoalBoard from './components/GoalBoard.jsx';
import GoalShowroom from './components/GoalShowroom';
import WidgetBar from './components/WidgetBar';
import VirtualCounselor from './components/VirtualCounselor.jsx';
import counselorImg from './assets/counselor.png'; // You need to add a sharp-looking image to src/assets/counselor.png

import { auth } from './js/firebase-init.js';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showWelcomeSticky, setShowWelcomeSticky] = useState(false);
  const [animatedText, setAnimatedText] = useState("");
  const [stickyNotes, setStickyNotes] = useState([]);
  const [padCategories, setPadCategories] = useState();
  const [showShowroom, setShowShowroom] = useState(false);
  const [pinnedGoals, setPinnedGoals] = useState([]); // {text, color, category, completedAt}
  const [completedGoals, setCompletedGoals] = useState([]); // {text, color, category, completedAt}
  const [showCounselor, setShowCounselor] = useState(false);
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

  // Load sticky notes from localStorage on mount and after login
  useEffect(() => {
    if (isLoggedIn) {
      const savedNotes = localStorage.getItem('stickyNotes');
      if (savedNotes) {
        setStickyNotes(JSON.parse(savedNotes));
      }
    }
  }, [isLoggedIn]);

  // Save sticky notes to localStorage whenever they change
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('stickyNotes', JSON.stringify(stickyNotes));
    }
  }, [stickyNotes, isLoggedIn]);

  // Load showroom state from localStorage
  useEffect(() => {
    const pinned = JSON.parse(localStorage.getItem('showroom_pinnedGoals') || '[]');
    const completed = JSON.parse(localStorage.getItem('showroom_completedGoals') || '[]');
    setPinnedGoals(pinned);
    setCompletedGoals(completed);
  }, []);

  // Persist showroom state to localStorage
  useEffect(() => {
    localStorage.setItem('showroom_pinnedGoals', JSON.stringify(pinnedGoals));
    localStorage.setItem('showroom_completedGoals', JSON.stringify(completedGoals));
  }, [pinnedGoals, completedGoals]);

  // Add a sticky note to the board
  const handleDropNote = (note) => {
    setStickyNotes((prev) => [...prev, note]);
  };

  // Remove a sticky note by index
  const handleDeleteNote = (idx) => {
    setStickyNotes((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      // Save trashed notes
      const trashed = JSON.parse(localStorage.getItem('trashedStickyNotes') || '[]');
      trashed.push(prev[idx]);
      localStorage.setItem('trashedStickyNotes', JSON.stringify(trashed));
      return updated;
    });
  };

  // Update categories/colors for sticky notes
  const handleUpdateCategories = (newCategories) => {
    setPadCategories(newCategories);
  };

  // Update a sticky note (for milestones)
  const handleUpdateNote = (idx, updatedNote) => {
    setStickyNotes(prev => {
      const updated = [...prev];
      updated[idx] = updatedNote;
      return updated;
    });
  };

  // When a goal is completed and mounted, add to pinnedGoals and remove from board
  const handleMountShowroom = (goal) => {
    setPinnedGoals(prev => [...prev, { ...goal, completedAt: Date.now() }]);
    if (!completedGoals.find(g => g.text === goal.text)) {
      setCompletedGoals(prev => [...prev, { ...goal, completedAt: Date.now() }]);
    }
    setStickyNotes(prev => prev.filter(g => g.text !== goal.text));
  };
  // Unpin from showroom
  const handleUnpin = (idx) => {
    setPinnedGoals(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <>
      {/* Only show Header and WidgetBar if logged in and not showing welcome sticky */}
      {isLoggedIn && !showWelcomeSticky && <Header onShowShowroom={() => setShowShowroom(true)} />}
      {isLoggedIn && !showWelcomeSticky && <WidgetBar goals={[...stickyNotes, ...pinnedGoals]} />}
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
              <StickyNotePad onCreate={handleDropNote} padColors={padCategories} onUpdateCategories={handleUpdateCategories} />
              {/* Virtual Life Counselor Widget */}
              {/* <div style={{ marginTop: 32 }}>
                <VirtualCounselor />
              </div> */}
            </div>
            <div>
              <h2 style={{ fontFamily: 'Patrick Hand, Comic Sans MS, cursive', color: '#4d2600', marginBottom: 8 }}>Goal Board</h2>
              <GoalBoard
                notes={stickyNotes}
                onDropNote={handleDropNote}
                onDeleteNote={handleDeleteNote}
                onUpdateNote={handleUpdateNote}
                onMountShowroom={handleMountShowroom}
              />
            </div>
          </div>
        )}
        {showShowroom && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fffbe8', border: '2.5px solid #ffd1dc', borderRadius: 18, boxShadow: '0 8px 32px #f4a26155', minWidth: 400, maxWidth: 1000, width: '90vw', maxHeight: '90vh', overflowY: 'auto', padding: 0, zIndex: 9999, position: 'relative' }}>
              <button onClick={() => setShowShowroom(false)} style={{ position: 'absolute', top: 18, right: 18, background: '#ffd1dc', color: '#4d2600', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 18, padding: '8px 24px', cursor: 'pointer', zIndex: 10000 }}>Close</button>
              <GoalShowroom pinnedGoals={pinnedGoals} completedGoals={completedGoals} onUnpin={handleUnpin} />
            </div>
          </div>
        )}
        {isLoggedIn && !showWelcomeSticky && (
          <button
            onClick={() => setShowCounselor(true)}
            style={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              zIndex: 3000,
              background: 'linear-gradient(135deg, #ffd1dc 60%, #b3e5fc 100%)',
              border: '3px solid #ffd54f',
              borderRadius: 18,
              padding: '10px 28px 10px 18px',
              boxShadow: '0 4px 24px #ffd1dc55, 0 2px 0 #fffbe8 inset',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              fontFamily: 'Patrick Hand, Comic Sans MS, cursive, sans-serif',
              fontWeight: 700,
              fontSize: 20,
              color: '#283593',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s, transform 0.2s',
            }}
            aria-label="Open Virtual Counselor"
            onMouseOver={e => (e.currentTarget.style.boxShadow = '0 8px 32px #1976d2aa')}
            onMouseOut={e => (e.currentTarget.style.boxShadow = '0 4px 24px #ffd1dc55, 0 2px 0 #fffbe8 inset')}
          >
            <img
              src={counselorImg}
              alt="Virtual Counselor"
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '2.5px solid #ffd54f',
                boxShadow: '0 2px 8px #f4a26188',
                background: '#fffbe8',
                objectFit: 'cover',
                marginRight: 8,
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
            />
            <span style={{ fontWeight: 900, fontSize: 22, color: '#b35c00', letterSpacing: 0.2 }}>Virtual Counselor</span>
          </button>
        )}
        {showCounselor && (
          <div style={{
            position: 'fixed',
            bottom: 110,
            right: 40,
            zIndex: 4000,
            background: 'none',
          }}>
            <div style={{
              position: 'relative',
              background: 'none',
            }}>
              <button
                onClick={() => setShowCounselor(false)}
                style={{
                  position: 'absolute',
                  top: -18,
                  right: -18,
                  background: '#ffd1dc',
                  color: '#4d2600',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  fontWeight: 700,
                  fontSize: 18,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px #0002',
                }}
                aria-label="Close Counselor"
              >×</button>
              <VirtualCounselor />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
