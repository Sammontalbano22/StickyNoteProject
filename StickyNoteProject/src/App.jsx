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
import CounselorDrawing from './components/CounselorDrawing.jsx';
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

  return (
    <>
      {/* Only show Header and WidgetBar if logged in and not showing welcome sticky */}
      {isLoggedIn && !showWelcomeSticky && <Header onShowShowroom={() => setShowShowroom(true)} />}
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
              <div className="sidebar-section">
                <WidgetBar goals={[...stickyNotes, ...pinnedGoals]} />
              </div>
              <div className="sidebar-section">
                <button className="counselor-btn" onClick={() => setShowCounselor(show => !show)}>
                  <CounselorDrawing size={36} />
                  <span>Virtual Counselor</span>
                </button>
              </div>
            </aside>
            <main className="main-sections">
              <section className="section-card">
                <h2>Sticky Note Pad</h2>
                <StickyNotePad onCreate={handleDropNote} padColors={padCategories} onUpdateCategories={handleUpdateCategories} />
              </section>
              <section className="section-card">
                <h2>Goal Board</h2>
                <GoalBoard
                  notes={stickyNotes}
                  onDropNote={handleDropNote}
                  onDeleteNote={handleDeleteNote}
                  onUpdateNote={handleUpdateNote}
                  onMountShowroom={handleMountShowroom}
                />
              </section>
            </main>
          </div>
        )}
        {showShowroom && (
          <div className="modal-overlay">
            <div className="modal-card">
              <button className="close-btn" onClick={() => setShowShowroom(false)}>Close</button>
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
