import React, { useState, useEffect } from 'react';

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
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 32, position: 'relative' }}>
      {/* AI Suggestions Modal/Panel */}
      {activeSuggestionIdx !== null && suggestions[activeSuggestionIdx] && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
          onClick={() => setActiveSuggestionIdx(null)}
        >
          <div style={{
            background: '#fffbe8',
            border: '2.5px solid #ffd1dc',
            borderRadius: 16,
            boxShadow: '0 8px 32px #f4a26155',
            minWidth: 320,
            maxWidth: 420,
            padding: 24,
            zIndex: 3100,
            position: 'relative',
            fontSize: '1em',
            color: '#4d2600',
          }}
            onClick={e => e.stopPropagation()}
          >
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
        style={{
          border: dragOver ? '3px dashed #f4a261' : undefined,
          minHeight: 320,
          minWidth: 340,
          background: dragOver ? '#fffbe8' : undefined,
          transition: 'background 0.2s, border 0.2s',
          flex: 1,
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {notes.length === 0 && (
          <div style={{ color: '#aaa', fontStyle: 'italic', textAlign: 'center', marginTop: 40 }}>
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
              style={{
                background: bgColor,
                color: fontColor,
                margin: 8,
                display: 'inline-flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'stretch',
                verticalAlign: 'top',
                minHeight: isEnlarged ? 260 : 120,
                minWidth: isEnlarged ? 260 : 120,
                maxWidth: isEnlarged ? 420 : 220,
                width: isEnlarged ? 320 : 160,
                height: isEnlarged ? 320 : 160,
                wordBreak: 'break-word',
                fontFamily: 'Patrick Hand, Comic Sans MS, cursive, sans-serif',
                fontSize: isEnlarged ? '1.7em' : '1.1em',
                boxShadow: isEnlarged ? '0 8px 32px #f4a26155' : '0 4px 18px #f4a26133',
                position: 'relative',
                cursor: 'grab',
                transition: 'all 0.22s cubic-bezier(.4,2,.6,.9)',
                zIndex: isEnlarged ? 10 : 1,
                borderRadius: 18,
                padding: isEnlarged ? '18px 18px 16px 18px' : '12px 12px 10px 12px',
                overflow: 'auto', // allow scrolling for all content
              }}
              draggable
              onDragStart={() => setDraggedIdx(idx)}
              onDragEnd={() => setDraggedIdx(null)}
            >
              {/* Top bar: Category & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                {/* Category pill: shrink, subtle, and single-line */}
                <span style={{
                  fontSize: isEnlarged ? 14 : 11,
                  color: fontColor === '#fff' ? '#fffbe8' : '#555',
                  background: '#fffbe8cc',
                  borderRadius: 10,
                  padding: isEnlarged ? '2px 10px' : '1px 7px',
                  fontWeight: 600,
                  letterSpacing: 0.2,
                  maxWidth: isEnlarged ? 120 : 70,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  border: '1px solid #ffe082',
                  boxShadow: '0 1px 2px #ffd1dc22',
                  lineHeight: 1.2,
                  marginRight: 4,
                  marginLeft: 0,
                  display: 'inline-block',
                }}>{note.category}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    aria-label={isEnlarged ? 'Shrink sticky note' : 'Enlarge sticky note'}
                    onClick={e => {
                      e.stopPropagation();
                      setEnlargedNotes(prev => ({ ...prev, [idx]: !isEnlarged }));
                    }}
                    style={{
                      background: isEnlarged ? '#ffd1dc' : '#b3e5fc',
                      color: '#4d2600',
                      border: '1.5px solid #f4a261',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 18,
                      width: 32,
                      height: 32,
                      boxShadow: '0 2px 8px #f4a26122',
                      cursor: 'pointer',
                      outline: isEnlarged ? '2px solid #f4a261' : 'none',
                      transition: 'all 0.18s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                    }}
                    title={isEnlarged ? 'Shrink note' : 'Enlarge note'}
                  >{isEnlarged ? '−' : '+'}</button>
                  <button
                    aria-label="View milestones"
                    onClick={e => {
                      e.stopPropagation();
                      setMilestoneModalIdx(idx);
                    }}
                    style={{
                      background: '#fffbe8',
                      color: '#4d2600',
                      border: '1.5px solid #f4a261',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 18,
                      width: 32,
                      height: 32,
                      boxShadow: '0 2px 8px #f4a26122',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.18s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                    }}
                    title="View milestones"
                  >📋</button>
                </div>
              </div>
              {/* Main note text */}
              <div style={{
                minHeight: 60,
                color: fontColor,
                textAlign: 'left',
                width: '100%',
                marginBottom: 8,
                fontWeight: 500,
                lineHeight: 1.25,
                padding: isEnlarged ? '0 2px' : '0 1px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 8,
                boxShadow: isEnlarged ? '0 1px 8px #ffd1dc22' : '0 1px 4px #ffd1dc11',
                overflow: 'auto', // allow scrolling if needed
                textOverflow: 'unset',
                whiteSpace: 'pre-line', // always allow wrapping
                wordBreak: 'break-word',
                maxHeight: isEnlarged ? 120 : 48, // limit height, but allow scroll
              }}>{note.text}</div>
              {/* Milestones Section (abbreviated) */}
              <div style={{ marginTop: 4, marginBottom: 2 }}>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: isEnlarged ? 6 : 3,
                }}>
                  {(note.milestones || []).slice(0, isEnlarged ? 10 : 6).map((ms, msIdx) => (
                    <li key={msIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: isEnlarged ? '0.85em' : '0.55em',
                        textDecoration: ms.checked ? 'line-through' : 'none',
                        opacity: ms.checked ? 0.6 : 1,
                        background: ms.checked ? '#e0e0e0' : 'rgba(255,255,255,0.18)',
                        borderRadius: 6,
                        padding: isEnlarged ? '4px 10px' : '2px 6px',
                        margin: 0,
                        width: '95%',
                        minWidth: 0,
                        maxWidth: '98%',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        boxShadow: '0 1px 4px #ffd1dc22',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.18s',
                      }}
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
                    <li style={{ fontSize: isEnlarged ? '0.8em' : '0.5em', color: '#b35c00', textAlign: 'center', marginTop: 2 }}>
                      …
                    </li>
                  )}
                </ul>
              </div>
              {/* Suggest Milestones Button */}
              {(!note.milestones || note.milestones.length === 0) && !suggestions[idx] && (
                <button
                  style={{ fontSize: isEnlarged ? '1em' : '0.7em', margin: '6px 0', background: '#b3e5fc', color: '#222', border: 'none', borderRadius: 6, padding: isEnlarged ? '6px 18px' : '2px 10px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 1px 4px #b3e5fc33' }}
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
        style={{
          width: 60,
          height: 120,
          marginLeft: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          border: trashOver ? '3px solid #b35c00' : '2px dashed #f4a261',
          borderRadius: 16,
          background: trashOver ? '#ffe082' : '#fffbe8',
          boxShadow: trashOver ? '0 0 16px #f4a26188' : '0 2px 8px #f4a26122',
          transition: 'all 0.2s',
          cursor: 'pointer',
        }}
        onDragOver={handleTrashDragOver}
        onDragLeave={handleTrashDragLeave}
        onDrop={handleTrashDrop}
      >
        <div style={{ marginTop: 18 }}>{TRASH_ICON}</div>
        <div style={{ fontSize: 13, color: '#b35c00', marginTop: 8, textAlign: 'center' }}>Trash</div>
        <div style={{ fontSize: 11, color: '#b35c00', marginTop: 2, textAlign: 'center', opacity: 0.7 }}>
          Drag here to delete
        </div>
      </div>
      {/* Milestones Modal */}
      {milestoneModalIdx !== null && notes[milestoneModalIdx] && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 4000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
          onClick={() => setMilestoneModalIdx(null)}
        >
          <div
            style={{
              background: '#fffbe8',
              border: '2.5px solid #ffd1dc',
              borderRadius: 16,
              boxShadow: '0 8px 32px #f4a26155',
              minWidth: 380,
              maxWidth: 600,
              width: '90vw',
              maxHeight: 540,
              padding: 32,
              zIndex: 4100,
              position: 'relative',
              fontSize: '1.08em',
              color: '#4d2600',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              boxSizing: 'border-box',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div id="milestone-modal-goal" style={{ fontWeight: 700, fontSize: '1.18em', marginBottom: 16, textAlign: 'center', background: '#ffd1dc22', borderRadius: 8, padding: 12 }}>
              {notes[milestoneModalIdx].text}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {(notes[milestoneModalIdx].milestones || []).map((ms, msIdx) => (
                <li key={msIdx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '1em',
                  textDecoration: ms.checked ? 'line-through' : 'none',
                  opacity: ms.checked ? 0.6 : 1,
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                  marginBottom: 10,
                  background: '#fff',
                  borderRadius: 6,
                  padding: '8px 12px',
                  boxShadow: '0 1px 4px #ffd1dc33',
                }}>
                  <input
                    type="checkbox"
                    checked={!!ms.checked}
                    onChange={() => {
                      const updated = [...(notes[milestoneModalIdx].milestones || [])];
                      updated[msIdx] = { ...updated[msIdx], checked: !updated[msIdx].checked };
                      onUpdateNote(milestoneModalIdx, { ...notes[milestoneModalIdx], milestones: updated });
                    }}
                    style={{ marginRight: 12, width: 18, height: 18 }}
                  />
                  <span style={{ flex: 1, fontSize: '1.08em', overflowWrap: 'anywhere' }}>{ms.text}</span>
                  <button
                    onClick={() => {
                      const updated = [...(notes[milestoneModalIdx].milestones || [])];
                      updated.splice(msIdx, 1);
                      onUpdateNote(milestoneModalIdx, { ...notes[milestoneModalIdx], milestones: updated });
                    }}
                    style={{ marginLeft: 12, color: '#e76f51', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}
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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 5000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
          onClick={() => setEnlargedMilestone(null)}
        >
          <div
            style={{
              background: '#fffbe8',
              border: '2.5px solid #ffd1dc',
              borderRadius: 16,
              boxShadow: '0 8px 32px #f4a26155',
              minWidth: 320,
              maxWidth: 480,
              width: '90vw',
              maxHeight: 340,
              padding: 32,
              zIndex: 5100,
              position: 'relative',
              fontSize: '1.15em',
              color: '#4d2600',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxSizing: 'border-box',
              justifyContent: 'center',
            }}
            onClick={e => e.stopPropagation()}
          >
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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.22)',
          zIndex: 6000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
          onClick={() => setCompletedGoalIdx(null)}
        >
          <div
            style={{
              background: '#fffbe8',
              border: '3px solid #ffd1dc',
              borderRadius: 22,
              boxShadow: '0 8px 32px #f4a26155',
              minWidth: 340,
              maxWidth: 480,
              width: '90vw',
              padding: 36,
              zIndex: 6100,
              position: 'relative',
              fontSize: '1.18em',
              color: '#4d2600',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 48, marginBottom: 10 }}>🏆</div>
            <div style={{ fontWeight: 800, fontSize: '1.3em', marginBottom: 10 }}>Congratulations!</div>
            <div style={{ marginBottom: 18 }}>You accomplished your goal:</div>
            <div style={{ fontWeight: 700, fontSize: '1.1em', marginBottom: 18, color: '#44bba4' }}>
              "{notes[completedGoalIdx].text}"
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', marginBottom: 18 }}>
              <button onClick={handleShareGoal} style={{ background: '#b3e5fc', color: '#222', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '1.08em', padding: '10px 0', cursor: 'pointer', width: '100%' }}>Share Goal 🎉</button>
              <button onClick={handleShareFacebook} style={{ background: '#4267B2', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '1.08em', padding: '10px 0', cursor: 'pointer', width: '100%' }}>Share on Facebook</button>
              <button onClick={handleReflectGoal} style={{ background: '#ffd1dc', color: '#4d2600', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '1.08em', padding: '10px 0', cursor: 'pointer', width: '100%' }}>Reflect on Goal 📝</button>
              <button onClick={handleMountShowroom} style={{ background: '#ffe082', color: '#b35c00', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '1.08em', padding: '10px 0', cursor: 'pointer', width: '100%' }}>Mount to Complete Goal Showroom 🏅</button>
              <button onClick={handleDeleteGoal} style={{ background: '#e76f51', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '1.08em', padding: '10px 0', cursor: 'pointer', width: '100%' }}>Delete Goal 🗑️</button>
            </div>
            <button onClick={() => setCompletedGoalIdx(null)} style={{ marginTop: 8, background: '#fff', color: '#4d2600', border: '1.5px solid #ffd1dc', borderRadius: 8, fontWeight: 600, fontSize: '1em', padding: '8px 32px', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalBoard;
