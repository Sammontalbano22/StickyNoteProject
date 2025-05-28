import React, { useState } from 'react';

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

const GoalBoard = ({ notes, onDropNote, onDeleteNote }) => {
  const [dragOver, setDragOver] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [trashOver, setTrashOver] = useState(false);

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
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 32 }}>
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
                maxWidth: 180,
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
              <div style={{ minHeight: 80, whiteSpace: 'pre-line', color: fontColor }}>{note.text}</div>
              <div style={{ position: 'absolute', bottom: 8, right: 8, fontSize: 13, color: fontColor === '#fff' ? '#fffbe8' : '#555', background: '#fffbe8cc', borderRadius: 4, padding: '2px 6px' }}>
                {note.category}
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
