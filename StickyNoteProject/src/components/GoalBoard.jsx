import React, { useState } from 'react';

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

const GoalBoard = ({ notes, onDropNote, onDeleteNote, onUpdateNote }) => {
  const [dragOver, setDragOver] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [trashOver, setTrashOver] = useState(false);
  const [suggestions, setSuggestions] = useState({}); // {idx: [suggestion, ...]}
  const [loadingSuggestionIdx, setLoadingSuggestionIdx] = useState(null);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(null); // For showing suggestions outside sticky note
  const [enlargedNotes, setEnlargedNotes] = useState({}); // {idx: true/false}
  const [milestoneModalIdx, setMilestoneModalIdx] = useState(null);

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
                display: 'inline-block',
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
              }}
              draggable
              onDragStart={() => setDraggedIdx(idx)}
              onDragEnd={() => setDraggedIdx(null)}
            >
              {/* Enlarge/Shrink button */}
              <button
                aria-label={isEnlarged ? 'Shrink sticky note' : 'Enlarge sticky note'}
                onClick={e => {
                  e.stopPropagation();
                  setEnlargedNotes(prev => ({ ...prev, [idx]: !isEnlarged }));
                }}
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  zIndex: 20,
                  background: isEnlarged ? '#ffd1dc' : '#b3e5fc',
                  color: '#4d2600',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: isEnlarged ? 22 : 18,
                  width: isEnlarged ? 38 : 28,
                  height: isEnlarged ? 38 : 28,
                  boxShadow: '0 2px 8px #f4a26122',
                  cursor: 'pointer',
                  outline: isEnlarged ? '2px solid #f4a261' : 'none',
                  transition: 'all 0.18s',
                }}
                title={isEnlarged ? 'Shrink note' : 'Enlarge note'}
              >{isEnlarged ? '−' : '+'}</button>
              {/* View Milestones Button */}
              <button
                aria-label="View milestones"
                onClick={e => {
                  e.stopPropagation();
                  setMilestoneModalIdx(idx);
                }}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 20,
                  background: '#fffbe8',
                  color: '#4d2600',
                  border: '1.5px solid #f4a261',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 18,
                  width: 28,
                  height: 28,
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
              <div style={{ minHeight: 60, whiteSpace: 'pre-line', color: fontColor, textAlign: 'center', width: '100%' }}>{note.text}</div>
              <div style={{ position: 'absolute', bottom: 8, right: 8, fontSize: 13, color: fontColor === '#fff' ? '#fffbe8' : '#555', background: '#fffbe8cc', borderRadius: 4, padding: '2px 6px' }}>
                {note.category}
              </div>
              {/* Suggested Milestones Button (opens modal/panel) */}
              {(!note.milestones || note.milestones.length === 0) && !suggestions[idx] && (
                <button
                  style={{ fontSize: '0.7em', margin: '6px 0', background: '#b3e5fc', color: '#222', border: 'none', borderRadius: 4, padding: '2px 10px', cursor: 'pointer' }}
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
              {/* Milestones Section (abbreviated) */}
              <div style={{ marginTop: 8 }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {(note.milestones || []).slice(0, 5).map((ms, msIdx) => (
                    <li key={msIdx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '0.38em', // much smaller font for all states
                      textDecoration: ms.checked ? 'line-through' : 'none',
                      opacity: ms.checked ? 0.6 : 1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      wordBreak: 'normal',
                      marginBottom: 2, // tighter spacing
                      maxWidth: isEnlarged ? 270 : 120, // fit within sticky note
                    }}>
                      <input
                        type="checkbox"
                        checked={!!ms.checked}
                        onChange={() => {
                          const updated = [...(note.milestones || [])];
                          updated[msIdx] = { ...updated[msIdx], checked: !updated[msIdx].checked };
                          onUpdateNote(idx, { ...note, milestones: updated });
                        }}
                        style={{ marginRight: 4, width: 10, height: 10 }}
                      />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{ms.text}</span>
                    </li>
                  ))}
                  {(note.milestones || []).length > 5 && (
                    <li style={{ fontSize: '0.38em', color: '#b35c00', textAlign: 'center', marginTop: 2 }}>
                      …
                    </li>
                  )}
                </ul>
              </div>
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
              minWidth: 320,
              maxWidth: 420,
              maxHeight: 420,
              padding: 24,
              zIndex: 4100,
              position: 'relative',
              fontSize: '1em',
              color: '#4d2600',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontWeight: 700, fontSize: '1.1em', marginBottom: 8, textAlign: 'center' }}>Milestones for this Goal</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {(notes[milestoneModalIdx].milestones || []).map((ms, msIdx) => (
                <li key={msIdx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.98em',
                  textDecoration: ms.checked ? 'line-through' : 'none',
                  opacity: ms.checked ? 0.6 : 1,
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                  marginBottom: 6,
                }}>
                  <input
                    type="checkbox"
                    checked={!!ms.checked}
                    onChange={() => {
                      const updated = [...(notes[milestoneModalIdx].milestones || [])];
                      updated[msIdx] = { ...updated[msIdx], checked: !updated[msIdx].checked };
                      onUpdateNote(milestoneModalIdx, { ...notes[milestoneModalIdx], milestones: updated });
                    }}
                    style={{ marginRight: 8 }}
                  />
                  <span style={{ flex: 1 }}>{ms.text}</span>
                  <button
                    onClick={() => {
                      const updated = [...(notes[milestoneModalIdx].milestones || [])];
                      updated.splice(msIdx, 1);
                      onUpdateNote(milestoneModalIdx, { ...notes[milestoneModalIdx], milestones: updated });
                    }}
                    style={{ marginLeft: 8, color: '#e76f51', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
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
              style={{ display: 'flex', marginTop: 12 }}
            >
              <input
                name={`ms-input-modal`}
                type="text"
                placeholder="Add step/milestone..."
                style={{ flex: 1, fontSize: '1em', borderRadius: 4, border: '1px solid #ccc', padding: '2px 6px' }}
              />
              <button type="submit" style={{ marginLeft: 8, fontSize: 16, background: '#b3e5fc', color: '#222', border: 'none', borderRadius: 4, padding: '2px 10px', cursor: 'pointer' }}>+</button>
            </form>
            <button
              onClick={() => setMilestoneModalIdx(null)}
              style={{ marginTop: 18, background: '#ffd1dc', color: '#4d2600', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: '1em', padding: '6px 18px', cursor: 'pointer', alignSelf: 'center' }}
            >Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalBoard;
