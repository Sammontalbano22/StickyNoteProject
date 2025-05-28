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
          return (
            <div
              key={idx}
              className="sticky-note"
              style={{
                background: bgColor,
                color: fontColor,
                margin: 8,
                display: 'inline-block',
                verticalAlign: 'top',
                minHeight: 120,
                minWidth: 120,
                maxWidth: 220,
                wordBreak: 'break-word',
                fontFamily: 'Patrick Hand, Comic Sans MS, cursive, sans-serif',
                fontSize: '1.1em',
                boxShadow: '0 4px 18px #f4a26133',
                position: 'relative',
                cursor: 'grab',
                transition: 'color 0.2s',
              }}
              draggable
              onDragStart={() => setDraggedIdx(idx)}
              onDragEnd={() => setDraggedIdx(null)}
            >
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
                  {(note.milestones || []).map((ms, msIdx) => (
                    <li key={msIdx} style={{ display: 'flex', alignItems: 'center', fontSize: '0.72em', textDecoration: ms.checked ? 'line-through' : 'none', opacity: ms.checked ? 0.6 : 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <input
                        type="checkbox"
                        checked={!!ms.checked}
                        onChange={() => {
                          const updated = [...(note.milestones || [])];
                          updated[msIdx] = { ...updated[msIdx], checked: !updated[msIdx].checked };
                          onUpdateNote(idx, { ...note, milestones: updated });
                        }}
                        style={{ marginRight: 6 }}
                      />
                      {ms.text}
                      <button
                        onClick={() => {
                          const updated = [...(note.milestones || [])];
                          updated.splice(msIdx, 1);
                          onUpdateNote(idx, { ...note, milestones: updated });
                        }}
                        style={{ marginLeft: 6, color: '#e76f51', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}
                        title="Delete milestone"
                      >✕</button>
                    </li>
                  ))}
                </ul>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    const input = e.target.elements[`ms-input-${idx}`];
                    const value = input.value.trim();
                    if (value) {
                      const updated = [...(note.milestones || []), { text: value, checked: false }];
                      onUpdateNote(idx, { ...note, milestones: updated });
                      input.value = '';
                    }
                  }}
                  style={{ display: 'flex', marginTop: 4 }}
                >
                  <input
                    name={`ms-input-${idx}`}
                    type="text"
                    placeholder="Add step/milestone..."
                    style={{ flex: 1, fontSize: '0.98em', borderRadius: 4, border: '1px solid #ccc', padding: '2px 6px' }}
                  />
                  <button type="submit" style={{ marginLeft: 4, fontSize: 15, background: '#b3e5fc', color: '#222', border: 'none', borderRadius: 4, padding: '2px 10px', cursor: 'pointer' }}>+</button>
                </form>
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
    </div>
  );
};

export default GoalBoard;
