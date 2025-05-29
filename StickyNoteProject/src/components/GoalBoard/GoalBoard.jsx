import React, { useState, useEffect } from 'react';
import './GoalBoard.css';

// Use backend proxy for AI suggestions
async function getSuggestedMilestones(goalText) {
  try {
    const response = await fetch('/api/ai-suggest-milestones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal: goalText })
    });
    const data = await response.json();
    return data.suggestions || ['(No suggestions found)'];
  } catch (e) {
    return ['(Error fetching suggestions)'];
  }
}

const padColors = [
  { color: '#ffe082', label: 'Personal' },
  { color: '#ffd1dc', label: 'Academic' },
  { color: '#b3e5fc', label: 'Career' },
  { color: '#dcedc8', label: 'Health' },
  { color: '#e1bee7', label: 'Other' },
];

const TRASH_ICON = (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="15" width="20" height="18" rx="3" fill="#f4a261" stroke="#b35c00" strokeWidth="2"/>
    <rect x="16" y="10" width="8" height="5" rx="2" fill="#ffe082" stroke="#b35c00" strokeWidth="1.5"/>
    <rect x="13" y="15" width="2" height="12" rx="1" fill="#fffbe8"/>
    <rect x="19" y="15" width="2" height="12" rx="1" fill="#fffbe8"/>
    <rect x="25" y="15" width="2" height="12" rx="1" fill="#fffbe8"/>
    <rect x="10" y="33" width="20" height="2" rx="1" fill="#b35c00"/>
  </svg>
);

const GoalBoard = ({ notes, onDropNote, onDeleteNote, onUpdateNote, onMountShowroom }) => {
  const [dragOver, setDragOver] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [trashOver, setTrashOver] = useState(false);
  const [suggestions, setSuggestions] = useState({}); // {idx: [suggestion, ...]}
  const [loadingSuggestionIdx, setLoadingSuggestionIdx] = useState(null);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(null); // For showing suggestions outside sticky note
  const [enlargedNotes, setEnlargedNotes] = useState({}); // {idx: true/false}
  const [milestoneModalIdx, setMilestoneModalIdx] = useState(null);
  const [enlargedMilestone, setEnlargedMilestone] = useState(null); // {noteIdx, msIdx} or null
  const [completedGoalIdx, setCompletedGoalIdx] = useState(null);
  const [hasReportedComplete, setHasReportedComplete] = useState({}); // {idx: true}

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const data = e.dataTransfer.getData('text/plain');
    if (data) {
      try {
        const note = JSON.parse(data);
        onDropNote(note);
      } catch {}
    }
  };

  // Trash drag events
  const handleTrashDragOver = (e) => {
    e.preventDefault();
    setTrashOver(true);
  };
  const handleTrashDragLeave = () => setTrashOver(false);
  const handleTrashDrop = (e) => {
    e.preventDefault();
    setTrashOver(false);
    if (draggedIdx !== null) {
      onDeleteNote(draggedIdx);
      setDraggedIdx(null);
    }
  };

  // Confetti trigger
  function showConfetti() {
    if (window.triggerConfetti) window.triggerConfetti();
  }

  // Watch for newly completed goals
  useEffect(() => {
    notes.forEach((note, idx) => {
      const validMilestones = (note.milestones || []).filter(ms => ms.text && ms.text.trim() !== '');
      const allChecked = validMilestones.length > 0 && validMilestones.every(ms => ms.checked);
      if (allChecked && !hasReportedComplete[idx]) {
        setCompletedGoalIdx(idx);
        setHasReportedComplete(prev => ({ ...prev, [idx]: true }));
        showConfetti();
      } else if (!allChecked && hasReportedComplete[idx]) {
        setHasReportedComplete(prev => {
          const copy = { ...prev };
          delete copy[idx];
          return copy;
        });
      }
    });
  }, [notes]);

  // Modal action handlers
  const handleShareGoal = () => {
    if (completedGoalIdx == null) return;
    const note = notes[completedGoalIdx];
    const text = `I just accomplished my goal: "${note.text}"! 🎉`;
    if (navigator.share) {
      navigator.share({ title: 'Goal Accomplished!', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Goal copied to clipboard!');
    }
  };
  const handleShareFacebook = () => {
    if (completedGoalIdx == null) return;
    const note = notes[completedGoalIdx];
    const text = `I just accomplished my goal: \"${note.text}\"! 🎉`;
    const url = encodeURIComponent(window.location.origin);
    const quote = encodeURIComponent(text);
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`;
    window.open(fbShareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  };
  const handleDeleteGoal = () => {
    if (completedGoalIdx == null) return;
    onDeleteNote(completedGoalIdx);
    setCompletedGoalIdx(null);
  };
  const handleReflectGoal = () => {
    // Open journal/reflect UI (mock: alert for now)
    if (completedGoalIdx == null) return;
    alert('Reflect on your goal! (This should open the journal UI.)');
    setCompletedGoalIdx(null);
  };
  const handleMountShowroom = () => {
    if (completedGoalIdx == null) return;
    if (onMountShowroom) onMountShowroom(notes[completedGoalIdx]);
    setCompletedGoalIdx(null);
  };

  return (
    <div className="goalboard-container">
      {/* AI Suggestions Modal/Panel */}
      {activeSuggestionIdx !== null && suggestions[activeSuggestionIdx] && (
        <div className="goalboard-modal-bg" onClick={() => setActiveSuggestionIdx(null)}>
          <div className="goalboard-modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: '1.1em', marginBottom: 8 }}>AI Milestone Suggestions</div>
            {suggestions[activeSuggestionIdx].map((sugg, sIdx) => (
              <div key={sIdx} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ flex: 1, wordBreak: 'break-word' }}>{sugg}</span>
                <button
                  style={{ marginLeft: 8, background: '#a8e6cf', color: '#222', border: 'none', borderRadius: 4, fontSize: '0.95em', cursor: 'pointer', padding: '2px 10px' }}
                  onClick={() => {
                    const note = notes[activeSuggestionIdx];
                    const newMilestones = [...(note.milestones || []), { text: sugg, checked: false }];
                    onUpdateNote(activeSuggestionIdx, { ...note, milestones: newMilestones });
                    setSuggestions(s => ({ ...s, [activeSuggestionIdx]: s[activeSuggestionIdx].filter((_, i) => i !== sIdx) }));
                  }}
                  title="Accept suggestion"
                >Accept</button>
                <button
                  style={{ marginLeft: 4, background: '#ff8b94', color: '#222', border: 'none', borderRadius: 4, fontSize: '0.95em', cursor: 'pointer', padding: '2px 10px' }}
                  onClick={() => {
                    setSuggestions(s => ({ ...s, [activeSuggestionIdx]: s[activeSuggestionIdx].filter((_, i) => i !== sIdx) }));
                  }}
                  title="Reject suggestion"
                >Reject</button>
              </div>
            ))}
            {suggestions[activeSuggestionIdx].length === 0 && <div style={{ color: '#888', fontStyle: 'italic' }}>No more suggestions</div>}
            <button
              style={{ marginTop: 12, background: '#ffd1dc', color: '#4d2600', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: '1em', padding: '6px 18px', cursor: 'pointer' }}
              onClick={() => setActiveSuggestionIdx(null)}
            >Close</button>
          </div>
        </div>
      )}
      <div
        id="sticky-board"
        className={dragOver ? 'drag-over' : ''}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div style={{ gridColumn: '1 / -1', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '18px 0 10px 0' }}>
          <h2 className="goalboard-title">Goal Board</h2>
        </div>
        {notes.length === 0 && (
          <div className="goalboard-empty">
            Drag a sticky note here to add it to your goal board!
          </div>
        )}
        {notes.map((note, idx) => {
          // Utility: get contrast color (black or white) for note background
          function getContrastYIQ(hex) {
            let c = hex.replace('#', '');
            if (c.length === 3) c = c.split('').map(x => x + x).join('');
            const r = parseInt(c.substr(0,2),16);
            const g = parseInt(c.substr(2,2),16);
            const b = parseInt(c.substr(4,2),16);
            const yiq = ((r*299)+(g*587)+(b*114))/1000;
            return yiq >= 160 ? '#222' : '#fff';
          }
          const bgColor = note.color || (padColors[note.colorIdx]?.color ?? '#ffe082');
          const fontColor = getContrastYIQ(bgColor);
          const isEnlarged = !!enlargedNotes[idx];
          return (
            <div
              key={idx}
              className={`sticky-note${isEnlarged ? ' enlarged' : ''}`}
              style={{ background: bgColor, color: fontColor }}
              draggable
              onDragStart={() => setDraggedIdx(idx)}
              onDragEnd={() => setDraggedIdx(null)}
            >
              {/* Top bar: Category & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                {/* Category pill: shrink, subtle, and single-line */}
                <span className="sticky-note-category" style={{ color: fontColor === '#fff' ? '#fffbe8' : '#555' }}>{note.category}</span>
                <div className="sticky-note-actions">
                  <button
                    aria-label={isEnlarged ? 'Shrink sticky note' : 'Enlarge sticky note'}
                    onClick={e => {
                      e.stopPropagation();
                      setEnlargedNotes(prev => ({ ...prev, [idx]: !isEnlarged }));
                    }}
                    className={`sticky-note-action-btn${isEnlarged ? ' enlarged' : ''}`}
                    title={isEnlarged ? 'Shrink note' : 'Enlarge note'}
                  >{isEnlarged ? '−' : '+'}</button>
                  <button
                    aria-label="View milestones"
                    onClick={e => {
                      e.stopPropagation();
                      setMilestoneModalIdx(idx);
                    }}
                    className="sticky-note-action-btn"
                    title="View milestones"
                  >📋</button>
                </div>
              </div>
              {/* Main note text */}
              <div className="sticky-note-main-text" style={{ color: fontColor }}>{note.text}</div>
              {/* Milestones Section (abbreviated) */}
              <div className="sticky-note-milestones">
                <ul className="sticky-note-milestones-list">
                  {(note.milestones || []).slice(0, isEnlarged ? 10 : 6).map((ms, msIdx) => (
                    <li key={msIdx}
                      className={`sticky-note-milestone-item${ms.checked ? ' checked' : ''}`}
                      onClick={e => {
                        e.stopPropagation();
                        setEnlargedMilestone({ noteIdx: idx, msIdx });
                      }}
                      title="Click to enlarge and view full milestone"
                    >
                      <input
                        type="checkbox"
                        checked={!!ms.checked}
                        onChange={ev => {
                          ev.stopPropagation();
                          const updated = [...(note.milestones || [])];
                          updated[msIdx] = { ...updated[msIdx], checked: !updated[msIdx].checked };
                          onUpdateNote(idx, { ...note, milestones: updated });
                        }}
                        style={{ marginRight: 8, width: isEnlarged ? 16 : 12, height: isEnlarged ? 16 : 12, flexShrink: 0 }}
                        onClick={ev => ev.stopPropagation()}
                      />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, textAlign: 'center' }}>{ms.text}</span>
                    </li>
                  ))}
                  {(note.milestones || []).length > (isEnlarged ? 10 : 6) && (
                    <li className="sticky-note-milestone-ellipsis">…</li>
                  )}
                </ul>
              </div>
              {(!note.milestones || note.milestones.length === 0) && !suggestions[idx] && (
                <button
                  className="sticky-note-suggest-btn"
                  disabled={loadingSuggestionIdx === idx}
                  onClick={async () => {
                    setLoadingSuggestionIdx(idx);
                    const sugg = await getSuggestedMilestones(note.text);
                    setSuggestions(s => ({ ...s, [idx]: sugg }));
                    setLoadingSuggestionIdx(null);
                    setActiveSuggestionIdx(idx);
                  }}
                >{loadingSuggestionIdx === idx ? 'Suggesting...' : '💡 Suggest Milestones'}</button>
              )}
            </div>
          );
        })}
      </div>
      <div
        id="sticky-trash"
        className={trashOver ? 'trash-over' : ''}
        onDragOver={handleTrashDragOver}
        onDragLeave={handleTrashDragLeave}
        onDrop={handleTrashDrop}
      >
        <div id="sticky-trash-icon">{TRASH_ICON}</div>
        <div id="sticky-trash-label">Trash</div>
        <div id="sticky-trash-desc">Drag here to delete</div>
      </div>
      {/* Milestones Modal */}
      {milestoneModalIdx !== null && notes[milestoneModalIdx] && (
        <div className="goalboard-milestone-modal-bg" onClick={() => setMilestoneModalIdx(null)}>
          <div className="goalboard-milestone-modal" onClick={e => e.stopPropagation()}>
            <div id="milestone-modal-goal" style={{ fontWeight: 700, fontSize: '1.18em', marginBottom: 16, textAlign: 'center', background: '#ffd1dc22', borderRadius: 8, padding: 12 }}>
              {notes[milestoneModalIdx].text}
            </div>
            <ul className="goalboard-milestone-list">
              {(notes[milestoneModalIdx].milestones || []).map((ms, msIdx) => (
                <li key={msIdx}
                  className={`goalboard-milestone-item${ms.checked ? ' checked' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={!!ms.checked}
                    onChange={() => {
                      const updated = [...(notes[milestoneModalIdx].milestones || [])];
                      updated[msIdx] = { ...updated[msIdx], checked: !updated[msIdx].checked };
                      onUpdateNote(milestoneModalIdx, { ...notes[milestoneModalIdx], milestones: updated });
                    }}
                    className="goalboard-milestone-checkbox"
                  />
                  <span className="goalboard-milestone-text">{ms.text}</span>
                  <button
                    onClick={() => {
                      const updated = [...(notes[milestoneModalIdx].milestones || [])];
                      updated.splice(msIdx, 1);
                      onUpdateNote(milestoneModalIdx, { ...notes[milestoneModalIdx], milestones: updated });
                    }}
                    className="goalboard-milestone-delete"
                    title="Delete milestone"
                  >✕</button>
                </li>
              ))}
            </ul>
            <form
              onSubmit={e => {
                e.preventDefault();
                const input = e.target.elements[`ms-input-modal`];
                const value = input.value.trim();
                if (value) {
                  const updated = [...(notes[milestoneModalIdx].milestones || []), { text: value, checked: false }];
                  onUpdateNote(milestoneModalIdx, { ...notes[milestoneModalIdx], milestones: updated });
                  input.value = '';
                }
              }}
              style={{ display: 'flex', marginTop: 18, gap: 12 }}
            >
              <input
                name={`ms-input-modal`}
                type="text"
                placeholder="Add step/milestone..."
                style={{ flex: 1, fontSize: '1em', borderRadius: 4, border: '1px solid #ccc', padding: '8px 12px' }}
              />
              <button type="submit" style={{ fontSize: 18, background: '#b3e5fc', color: '#222', border: 'none', borderRadius: 4, padding: '8px 22px', cursor: 'pointer' }}>+</button>
            </form>
            <button
              onClick={() => setMilestoneModalIdx(null)}
              style={{ marginTop: 28, background: '#ffd1dc', color: '#4d2600', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '1.08em', padding: '12px 36px', cursor: 'pointer', alignSelf: 'center', boxShadow: '0 2px 8px #ffd1dc33' }}
            >Close</button>
          </div>
        </div>
      )}
      {/* Enlarged Milestone Modal */}
      {enlargedMilestone && notes[enlargedMilestone.noteIdx] && notes[enlargedMilestone.noteIdx].milestones && (
        <div className="goalboard-enlarged-ms-modal-bg" onClick={() => setEnlargedMilestone(null)}>
          <div className="goalboard-enlarged-ms-modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: '1.18em', marginBottom: 18, textAlign: 'center', background: '#ffd1dc22', borderRadius: 8, padding: 14, width: '100%' }}>
              {notes[enlargedMilestone.noteIdx].milestones[enlargedMilestone.msIdx].text}
            </div>
            <button
              onClick={() => setEnlargedMilestone(null)}
              style={{ marginTop: 12, background: '#ffd1dc', color: '#4d2600', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '1.08em', padding: '10px 32px', cursor: 'pointer', alignSelf: 'center', boxShadow: '0 2px 8px #ffd1dc33' }}
            >Close</button>
          </div>
        </div>
      )}
      {/* Congratulations Modal */}
      {completedGoalIdx !== null && notes[completedGoalIdx] && (
        <div className="goalboard-congrats-modal-bg" onClick={() => setCompletedGoalIdx(null)}>
          <div className="goalboard-congrats-modal" onClick={e => e.stopPropagation()}>
            <div className="goalboard-congrats-title">🏆</div>
            <div className="goalboard-congrats-header">Congratulations!</div>
            <div style={{ marginBottom: 18 }}>You accomplished your goal:</div>
            <div className="goalboard-congrats-goal">"{notes[completedGoalIdx].text}"</div>
            <div className="goalboard-congrats-btns">
              <button onClick={handleShareGoal} className="goalboard-congrats-btn share">Share Goal 🎉</button>
              <button onClick={handleShareFacebook} className="goalboard-congrats-btn fb">Share on Facebook</button>
              <button onClick={handleReflectGoal} className="goalboard-congrats-btn reflect">Reflect on Goal 📝</button>
              <button onClick={handleMountShowroom} className="goalboard-congrats-btn showroom">Mount to Complete Goal Showroom 🏅</button>
              <button onClick={handleDeleteGoal} className="goalboard-congrats-btn delete">Delete Goal 🗑️</button>
            </div>
            <button onClick={() => setCompletedGoalIdx(null)} className="goalboard-congrats-close">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalBoard;
