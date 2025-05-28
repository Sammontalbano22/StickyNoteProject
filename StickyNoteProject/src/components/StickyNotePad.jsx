import React, { useState, useRef } from 'react';

const padColors = [
  { color: '#ffe082', label: 'Personal' },
  { color: '#ffd1dc', label: 'Academic' },
  { color: '#b3e5fc', label: 'Career' },
  { color: '#dcedc8', label: 'Health' },
  { color: '#e1bee7', label: 'Other' },
];

const StickyNotePad = ({ onCreate }) => {
  const [currentText, setCurrentText] = useState('');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const textareaRef = useRef(null);

  // When user types, update the current sticky note
  const handleChange = (e) => {
    setCurrentText(e.target.value);
  };

  // Drag the sticky note to the board
  const handleDragStart = (e) => {
    if (currentText.trim()) {
      e.dataTransfer.setData('text/plain', JSON.stringify({ text: currentText, colorIdx: selectedColorIdx }));
      setCurrentText('');
    }
  };

  // For board drop helper (optional, for compatibility)
  const handleDropToBoard = () => {
    if (currentText.trim()) {
      onCreate({ text: currentText, colorIdx: selectedColorIdx });
      setCurrentText('');
    }
  };

  return (
    <div style={{ background: 'transparent', boxShadow: 'none', padding: 0, margin: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, gap: 8 }}>
        {padColors.map((c, idx) => (
          <button
            key={c.color}
            aria-label={c.label}
            onClick={() => setSelectedColorIdx(idx)}
            style={{
              width: 28, height: 28, borderRadius: '50%', border: selectedColorIdx === idx ? '2.5px solid #333' : '1.5px solid #bbb',
              background: c.color,
              cursor: 'pointer',
              outline: 'none',
              boxShadow: selectedColorIdx === idx ? '0 0 0 2px #f4a26155' : 'none',
              marginRight: 2,
            }}
          />
        ))}
      </div>
      <div
        className="sticky-note-real editing writing"
        style={{
          top: 0,
          left: 0,
          background: padColors[selectedColorIdx].color,
          zIndex: 2,
          fontFamily: `'Patrick Hand', cursive`,
          boxShadow: '0 8px 32px #f4a26199',
          cursor: currentText ? 'grab' : 'text',
          minHeight: '200px',
          minWidth: '200px',
          width: '200px',
          height: '200px',
          padding: 0,
          display: 'flex',
          alignItems: 'stretch',
          position: 'relative',
          margin: '0 auto',
        }}
        draggable={!!currentText}
        onDragStart={currentText ? handleDragStart : undefined}
      >
        <textarea
          ref={textareaRef}
          value={currentText}
          onChange={handleChange}
          placeholder="Write your note..."
          rows={6}
          className="sticky-note-input"
          style={{
            fontFamily: `'Patrick Hand', cursive`,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            width: '100%',
            height: '100%',
            resize: 'none',
            fontSize: '1.15em',
            color: '#5d4037',
            padding: '1em 1em 1.5em 1em',
          }}
          autoFocus
        />
      </div>
      <div style={{ display: 'none' }} id="sticky-note-drop-helper" onDrop={handleDropToBoard} />
    </div>
  );
};

export default StickyNotePad;
