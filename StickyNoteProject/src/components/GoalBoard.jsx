import React, { useState } from 'react';

const padColors = [
  { color: '#ffe082', label: 'Personal' },
  { color: '#ffd1dc', label: 'Academic' },
  { color: '#b3e5fc', label: 'Career' },
  { color: '#dcedc8', label: 'Health' },
  { color: '#e1bee7', label: 'Other' },
];

const GoalBoard = ({ notes, onDropNote }) => {
  const [dragOver, setDragOver] = useState(false);

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

  return (
    <div
      id="sticky-board"
      style={{
        border: dragOver ? '3px dashed #f4a261' : undefined,
        minHeight: 320,
        minWidth: 340,
        background: dragOver ? '#fffbe8' : undefined,
        transition: 'background 0.2s, border 0.2s',
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
      {notes.map((note, idx) => (
        <div
          key={idx}
          className="sticky-note"
          style={{
            background: padColors[note.colorIdx]?.color || '#ffe082',
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
          }}
        >
          <div style={{ minHeight: 80, whiteSpace: 'pre-line' }}>{note.text}</div>
        </div>
      ))}
    </div>
  );
};

export default GoalBoard;
