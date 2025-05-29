import { useEffect, useState } from 'react';
import './App.css';
import '/public/css/main.css';

import Header from './components/header/header.jsx';
import Auth from './components/Auth/Auth.jsx';
import StickyNotePad from './components/StickyNotePad/StickyNotePad.jsx';
import GoalBoard from './components/GoalBoard/GoalBoard.jsx';
import GoalShowroom from './components/GoalShowroom/GoalShowroom.jsx';
import WidgetBar from './components/WidgetBar/WidgetBar.jsx';
import VirtualCounselor from './components/VirtualCounselor/VirtualCounselor.jsx';
import CounselorDrawing from './components/CounselorDrawing/CounselorDrawing.jsx';
import { API } from './js/api.js';

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
  const [showWidgetBar, setShowWidgetBar] = useState(false);
  const stickyMessage = "I am Accomplishing my Goals!";

  // Log whenever pinnedGoals changes
  useEffect(() => {
    console.log('[DEBUG] pinnedGoals updated:', pinnedGoals);
  }, [pinnedGoals]);

  // Log when completedGoals changes
  useEffect(() => {
    console.log('[DEBUG] completedGoals updated:', completedGoals);
  }, [completedGoals]);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('[DEBUG] Auth state changed. User:', user);
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
      // Log loading pinned/completed goals from backend/localStorage
      console.log('[DEBUG] Loading showroom state after login');
    }
  }, [isLoggedIn]);

  // Save sticky notes to localStorage whenever they change
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('stickyNotes', JSON.stringify(stickyNotes));
    }
  }, [stickyNotes, isLoggedIn]);

  // Load showroom state from backend on login
  useEffect(() => {
    if (isLoggedIn) {
      API.getShowroom().then(res => {
        let loadedPinned = res && res.pinnedGoals ? res.pinnedGoals : null;
        let loadedCompleted = res && res.completedGoals ? res.completedGoals : null;
        // Fallback to localStorage if backend returns nothing
        if (!loadedPinned || loadedPinned.length === 0) {
          const localPinned = localStorage.getItem('pinnedGoals');
          loadedPinned = localPinned ? JSON.parse(localPinned) : [];
        }
        if (!loadedCompleted || loadedCompleted.length === 0) {
          const localCompleted = localStorage.getItem('completedGoals');
          loadedCompleted = localCompleted ? JSON.parse(localCompleted) : [];
        }
        console.log('[DEBUG] Loaded pinnedGoals from backend/localStorage:', loadedPinned);
        setPinnedGoals(loadedPinned);
        setCompletedGoals(loadedCompleted);
      }).catch(() => {
        // On error, fallback to localStorage
        const localPinned = localStorage.getItem('pinnedGoals');
        const localCompleted = localStorage.getItem('completedGoals');
        console.log('[DEBUG] Backend error, loaded pinnedGoals from localStorage:', localPinned);
        setPinnedGoals(localPinned ? JSON.parse(localPinned) : []);
        setCompletedGoals(localCompleted ? JSON.parse(localCompleted) : []);
      });
    }
  }, [isLoggedIn]);

  // Persist showroom state to backend
  useEffect(() => {
    if (isLoggedIn) {
      API.saveShowroom(pinnedGoals, completedGoals);
    }
  }, [pinnedGoals, completedGoals, isLoggedIn]);

  // Get coach persona from localStorage
  const [coachPersona, setCoachPersona] = useState(() => localStorage.getItem('coach_persona') || 'cheerleader');
  useEffect(() => {
    const handleStorage = () => setCoachPersona(localStorage.getItem('coach_persona') || 'cheerleader');
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

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
    const newPinned = [...pinnedGoals, { ...goal, completedAt: Date.now() }];
    let newCompleted = completedGoals;
    if (!completedGoals.find(g => g.text === goal.text)) {
      newCompleted = [...completedGoals, { ...goal, completedAt: Date.now() }];
    }
    console.log('[DEBUG] Pinning goal:', goal, 'New pinnedGoals:', newPinned);
    setPinnedGoals(newPinned);
    setCompletedGoals(newCompleted);
    setStickyNotes(prev => prev.filter(g => g.text !== goal.text));
    // Save to localStorage immediately
    localStorage.setItem('pinnedGoals', JSON.stringify(newPinned));
    localStorage.setItem('completedGoals', JSON.stringify(newCompleted));
    // Save to backend if logged in
    if (isLoggedIn) {
      API.saveShowroom(newPinned, newCompleted);
    }
  };
  // Unpin from showroom
  const handleUnpin = (idx) => {
    const newPinned = pinnedGoals.filter((_, i) => i !== idx);
    console.log('[DEBUG] Unpinning goal at idx', idx, 'New pinnedGoals:', newPinned);
    setPinnedGoals(newPinned);
    localStorage.setItem('pinnedGoals', JSON.stringify(newPinned));
    if (isLoggedIn) {
      API.saveShowroom(newPinned, completedGoals);
    }
  };

  // Handler for VirtualCounselor to create a new goal
  const handleCounselorCreateGoal = async (goalText) => {
    // Add to stickyNotes and persist
    const newGoal = {
      text: goalText,
      colorIdx: 0,
      category: padCategories?.[0]?.label || 'Personal',
      color: padCategories?.[0]?.color || '#ffe082',
      milestones: [],
    };
    setStickyNotes(prev => [...prev, newGoal]);
    // Optionally, call API.saveGoal(goalText) if backend needed
    try { await API.saveGoal(goalText); } catch {}
  };

  // Handler for VirtualCounselor to add a milestone to a goal
  const handleCounselorAddMilestone = (goalIdx, milestoneText) => {
    setStickyNotes(prev => {
      const updated = [...prev];
      if (!updated[goalIdx].milestones) updated[goalIdx].milestones = [];
      updated[goalIdx].milestones.push({ text: milestoneText, checked: false });
      return updated;
    });
    // Optionally, call API.addMilestone if backend needed
    const goal = stickyNotes[goalIdx];
    if (goal && goal.id) {
      try { API.addMilestone(goal.id, milestoneText); } catch {}
    }
  };

  // Pin/unpin goals
  const handleCounselorPinGoal = (goalIdx) => {
    const goal = stickyNotes[goalIdx];
    if (goal) handleMountShowroom(goal);
  };
  const handleCounselorUnpinGoal = (goalText) => {
    setPinnedGoals(prev => prev.filter(g => g.text !== goalText));
  };

  // Show pinned/completed goals
  const handleCounselorShowPinned = () => setShowShowroom(true);
  const handleCounselorShowCompleted = () => setShowShowroom(true);

  // WidgetBar features
  const [widgetBarRef, setWidgetBarRef] = useState();
  const handleCounselorAddWidget = (widget) => {
    if (widgetBarRef && widgetBarRef.addWidget) widgetBarRef.addWidget(widget);
  };
  const handleCounselorListWidgets = () => {
    if (widgetBarRef && widgetBarRef.getWidgets) return widgetBarRef.getWidgets();
    return [];
  };
  const handleCounselorDeleteWidget = (idx) => {
    if (widgetBarRef && widgetBarRef.removeWidget) widgetBarRef.removeWidget(idx);
  };

  // Habit Tracker
  const handleCounselorOpenHabitTracker = () => setShowWidgetBar(true);

  // Journal
  const handleCounselorOpenJournal = () => {
    // Could set a state to open journal modal if implemented
  };
  const handleCounselorAddJournalEntry = (entry) => {
    // Could call API.addEntry or update state
  };

  // Motivational quote
  const handleCounselorAddQuoteWidget = (quote) => handleCounselorAddWidget({ type: 'quote', content: quote, goal: '' });

  // Playlist/image widget
  const handleCounselorAddPlaylistWidget = (url) => handleCounselorAddWidget({ type: 'playlist', content: url, goal: '' });
  const handleCounselorAddImageWidget = (url) => handleCounselorAddWidget({ type: 'image', content: url, goal: '' });

  // Progress summary
  const handleCounselorShowProgress = () => {
    return {
      totalGoals: stickyNotes.length + pinnedGoals.length,
      completedGoals: completedGoals.length,
      pinnedGoals: pinnedGoals.length,
      totalMilestones: stickyNotes.reduce((sum, g) => sum + (g.milestones?.length || 0), 0),
    };
  };

  // Load pinnedGoals and completedGoals from localStorage if not logged in or backend fails
  useEffect(() => {
    if (!isLoggedIn) {
      const pinned = localStorage.getItem('pinnedGoals');
      const completed = localStorage.getItem('completedGoals');
      console.log('[DEBUG] Not logged in, loading pinnedGoals from localStorage:', pinned);
      if (pinned) setPinnedGoals(JSON.parse(pinned));
      if (completed) setCompletedGoals(JSON.parse(completed));
    }
  }, [isLoggedIn]);

  // Save pinnedGoals and completedGoals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pinnedGoals', JSON.stringify(pinnedGoals));
  }, [pinnedGoals]);
  useEffect(() => {
    localStorage.setItem('completedGoals', JSON.stringify(completedGoals));
  }, [completedGoals]);

  return (
    <>
      {isLoggedIn && !showWelcomeSticky && <Header onShowShowroom={() => setShowShowroom(true)} />}
      {/* Place WidgetBar directly below header, spanning full width, horizontal layout */}
      {isLoggedIn && !showWelcomeSticky && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 0 24px 0', position: 'relative' }}>
          <WidgetBar goals={[...stickyNotes, ...pinnedGoals]} />
        </div>
      )}
      {/* Fixed Virtual Counselor button at bottom left, flush with screen edge */}
      {isLoggedIn && !showWelcomeSticky && (
        <div style={{ position: 'fixed', left: 10, bottom: 32, zIndex: 3000, display: 'flex', justifyContent: 'flex-start', pointerEvents: 'none' }}>
          <button
            className="counselor-btn"
            style={{
              pointerEvents: 'auto',
              background: '#ffe082', // changed from gradient to solid yellow
              border: '2.5px solid #ffd1dc',
              borderRadius: '18px 22px 16px 20px/20px 16px 22px 18px',
              fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
              fontSize: 22,
              color: '#b35c00',
              fontWeight: 900,
              padding: '16px 38px 16px 24px',
              boxShadow: '0 4px 18px #ffd1dc33, 0 2px 0 #fffbe8 inset',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              outline: 'none',
              cursor: 'pointer',
              transition: 'box-shadow 0.18s, background 0.18s',
            }}
            onClick={() => setShowCounselor(show => !show)}
          >
            <CounselorDrawing size={36} />
            <span>Virtual Counselor</span>
          </button>
        </div>
      )}
      <div className="App main-layout">
        {showWelcomeSticky && (
          <div className="welcome-sticky-modal">
            <div className="welcome-sticky-text">{animatedText}</div>
            <style>{`@keyframes pop-in {0%{transform:scale(0.7) rotate(-6deg);opacity:0;} 60%{transform:scale(1.08) rotate(2deg);opacity:1;} 100%{transform:scale(1) rotate(0deg);opacity:1;}}`}</style>
          </div>
        )}
        {!isLoggedIn && !showWelcomeSticky && <Auth />}
        {isLoggedIn && !showWelcomeSticky && (
          <div className="main-content-grid">
            <aside className="sidebar">
              {/* Virtual Counselor button removed from sidebar */}
            </aside>
            <main className="main-sections">
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 40, width: '100%' }}>
                <section className="section-card" style={{ flex: 1, minWidth: 340 }}>
                  {/* <div style={{ transform: 'translateX(-32px)' }}> */}
                    <StickyNotePad
                      onCreate={handleDropNote}
                      padColors={padCategories}
                      onUpdateCategories={handleUpdateCategories}
                    />
                  {/* </div> */}
                </section>
                <section className="section-card" style={{ flex: 2, minWidth: 340 }}>
                  <GoalBoard
                    notes={stickyNotes}
                    onDropNote={handleDropNote}
                    onDeleteNote={handleDeleteNote}
                    onUpdateNote={handleUpdateNote}
                    onMountShowroom={handleMountShowroom}
                  />
                </section>
              </div>
            </main>

          </div>
        )}
        {showShowroom && (
          <div className="modal-overlay">
            <div className="modal-card">
              <button className="close-btn" onClick={() => setShowShowroom(false)}>Close</button>
              {/* Log when rendering GoalShowroom */}
              {console.log('[DEBUG] Rendering GoalShowroom with pinnedGoals:', pinnedGoals)}
              <GoalShowroom pinnedGoals={pinnedGoals} completedGoals={completedGoals} onUnpin={handleUnpin} />
            </div>
          </div>
        )}
        {showCounselor && (
          <div className="modal-overlay counselor-modal">
            <div className="modal-card">
              <button className="close-btn" onClick={() => setShowCounselor(false)}>×</button>
              <VirtualCounselor
                onCreateGoal={handleCounselorCreateGoal}
                onAddMilestone={handleCounselorAddMilestone}
                onPinGoal={handleCounselorPinGoal}
                onUnpinGoal={handleCounselorUnpinGoal}
                onShowPinned={handleCounselorShowPinned}
                onShowCompleted={handleCounselorShowCompleted}
                onAddWidget={handleCounselorAddWidget}
                onListWidgets={handleCounselorListWidgets}
                onDeleteWidget={handleCounselorDeleteWidget}
                onOpenHabitTracker={handleCounselorOpenHabitTracker}
                onShowProgress={handleCounselorShowProgress}
                onOpenShowroom={handleCounselorShowPinned}
                onOpenJournal={handleCounselorOpenJournal}
                onAddJournalEntry={handleCounselorAddJournalEntry}
                onAddQuoteWidget={handleCounselorAddQuoteWidget}
                onAddPlaylistWidget={handleCounselorAddPlaylistWidget}
                onAddImageWidget={handleCounselorAddImageWidget}
                goals={stickyNotes}
                pinnedGoals={pinnedGoals}
                completedGoals={completedGoals}
                getProgress={handleCounselorShowProgress}
                coachPersona={coachPersona}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
