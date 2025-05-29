import React, { useState, useRef, useEffect } from 'react';

// Returns white for dark backgrounds, black for light backgrounds
function getContrastColor(hex) {
  // Remove # if present
  hex = hex.replace('#', '');
  // Convert 3-digit hex to 6-digit
  if (hex.length === 3) {
    hex = hex.split('').map(x => x + x).join('');
  }
  const r = parseInt(hex.substr(0,2),16);
  const g = parseInt(hex.substr(2,2),16);
  const b = parseInt(hex.substr(4,2),16);
  // YIQ formula
  const yiq = (r*299 + g*587 + b*114) / 1000;
  return yiq >= 128 ? '#5d4037' : '#fff';
}

const defaultPadColors = [
  { color: '#ffe082', label: 'Personal' },
  { color: '#ffd1dc', label: 'Academic' },
  { color: '#b3e5fc', label: 'Career' },
  { color: '#dcedc8', label: 'Health' },
  { color: '#e1bee7', label: 'Other' },
];

const StickyNotePad = ({ onCreate, padColors: propPadColors, onUpdateCategories }) => {
  const [currentText, setCurrentText] = useState('');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [editCategories, setEditCategories] = useState(false);
  const [categories, setCategories] = useState(propPadColors || defaultPadColors);
  const [pendingCategories, setPendingCategories] = useState([]); // Only used while editing
  const [showHelp, setShowHelp] = useState(() => {
    // Show help if not dismissed
    return localStorage.getItem('stickyNoteHelpDismissed') !== 'true';
  });
  const textareaRef = useRef(null);

  useEffect(() => {
    // Show help on mount if not dismissed
    if (localStorage.getItem('stickyNoteHelpDismissed') !== 'true') {
      setShowHelp(true);
    }
  }, []);

  const handleChange = (e) => {
    setCurrentText(e.target.value);
  };

  // Drag the sticky note to the board
  const handleDragStart = (e) => {
    if (currentText.trim()) {
      e.dataTransfer.setData('text/plain', JSON.stringify({
        text: currentText,
        colorIdx: selectedColorIdx,
        category: categories[selectedColorIdx].label,
        color: categories[selectedColorIdx].color // Pass the actual color
      }));
      setCurrentText('');
    }
  };

  // For board drop helper (optional, for compatibility)
  const handleDropToBoard = () => {
    if (currentText.trim()) {
      onCreate({
        text: currentText,
        colorIdx: selectedColorIdx,
        category: categories[selectedColorIdx].label,
        color: categories[selectedColorIdx].color // Pass the actual color
      });
      setCurrentText('');
    }
  };

  // Open edit: copy categories to pending ONCE
  const openEditCategories = () => {
    setPendingCategories(categories.map(cat => ({ ...cat })));
    setEditCategories(true);
  };

  // Apply changes
  const applyCategoryChanges = () => {
    setCategories(pendingCategories);
    setEditCategories(false);
    if (onUpdateCategories) onUpdateCategories(pendingCategories);
  };

  // Cancel changes
  const cancelCategoryChanges = () => {
    setEditCategories(false);
  };

  // Edit pending category label
  const handlePendingCategoryLabelChange = (idx, newLabel) => {
    setPendingCategories(prev => prev.map((cat, i) => i === idx ? { ...cat, label: newLabel } : cat));
  };

  // Edit pending color
  const handlePendingCategoryColorChange = (idx, newColor) => {
    setPendingCategories(prev => prev.map((cat, i) => i === idx ? { ...cat, color: newColor } : cat));
  };

  const handleCloseHelp = () => setShowHelp(false);
  const handleDontShowAgain = () => {
    localStorage.setItem('stickyNoteHelpDismissed', 'true');
    setShowHelp(false);
  };

  // Wrap the entire pad in a styled box
  return (
    <div className="note-pad-container" style={{
      // background: 'linear-gradient(120deg, #fffbe8 80%, #ffe082 100%)',
      // marginTop: '-.75in',
      marginLeft: 0, // Move box to the left edge
      borderRadius: 18,
      boxShadow: '0 4px 18px #ffd1dc33, 0 2px 0 #fffbe8 inset',
      border: '2.5px dashed #f4a261',
      padding: '2em 1.5em 1.5em 1.5em',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minWidth: 260,
      maxWidth: 380,
      position: 'relative',
      zIndex: 2,
      alignSelf: 'flex-start', // If inside a flex container, stick to left
    }}>
      {/* Centered Sticky Note Pad title inside the box */}
      <h2 className="goalboard-title">
        Sticky Note Pad
      </h2>
      <div style={{ background: 'transparent', boxShadow: 'none', padding: 0, margin: 0, width: '100%' }}>
        {/* Help UI: show if showHelp is true */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <button
            aria-label="Sticky Note Help"
            style={{ background: '#fffbe8', border: '1.5px solid #bbb', borderRadius: 8, fontSize: 18, cursor: 'pointer', padding: '0 10px', height: 32, marginRight: 8 }}
            onClick={() => setShowHelp(v => !v)}
            title="How does this work?"
          >❓</button>
        </div>
        {showHelp && (
          <div style={{
            background: '#fffbe8',
            border: '2px solid #f4a261',
            borderRadius: 12,
            boxShadow: '0 4px 18px #f4a26122',
            padding: '1.2em 1.5em',
            marginBottom: 12,
            maxWidth: 380,
            margin: '0 auto 12px auto',
            position: 'relative',
            zIndex: 10,
          }}>
            <div style={{ fontWeight: 700, fontSize: '1.15em', color: '#b35c00', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span role="img" aria-label="info">📝</span> How to Use Sticky Notes
            </div>
            <ul style={{ fontSize: '1em', color: '#4d2600', margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
              <li><b>Create:</b> Write your goal in the note pad, pick a color/category, then drag the note onto the board.</li>
              <li><b>Edit Categories:</b> Click the ✏️ button to rename or recolor categories. Changes apply only when you click Apply.</li>
              <li><b>Pin/Unpin:</b> Drag notes from the pad to the board to "pin" them. Notes on the board stay until deleted.</li>
              <li><b>Delete:</b> Drag a note to the trashcan to remove it. Deleted notes are saved and persist until you clear them.</li>
              <li><b>Colors & Contrast:</b> Font color automatically adjusts for readability based on your note color.</li>
              <li><b>Persistence:</b> All notes and categories are saved in your browser and restored when you log in again.</li>
            </ul>
            <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
              <button onClick={handleCloseHelp} style={{ background: '#ffd1dc', color: '#4d2600', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, cursor: 'pointer' }}>Close</button>
              <button onClick={handleDontShowAgain} style={{ background: '#bbb', color: '#333', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, cursor: 'pointer' }}>Don't show again</button>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 8, gap: 12 }}>
          {categories.map((c, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 8, minWidth: 60 }}>
              <button
                aria-label={c.label}
                onClick={() => setSelectedColorIdx(idx)}
                style={{
                  width: 32, height: 32, borderRadius: '50%', border: selectedColorIdx === idx ? '2.5px solid #333' : '1.5px solid #bbb',
                  background: c.color,
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: selectedColorIdx === idx ? '0 0 0 2px #f4a26155' : 'none',
                  marginBottom: 4,
                  transition: 'box-shadow 0.2s',
                }}
                title={c.label}
              />
              <span style={{
                fontSize: 13,
                color: '#333',
                background: selectedColorIdx === idx ? '#ffe082' : 'transparent',
                borderRadius: 4,
                padding: '2px 6px',
                textAlign: 'center',
                maxWidth: 70,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: selectedColorIdx === idx ? 600 : 400,
                border: selectedColorIdx === idx ? '1px solid #f4a261' : 'none',
              }}>{c.label}</span>
            </div>
          ))}
          <button
            style={{ marginLeft: 8, background: '#fffbe8', border: '1.5px solid #bbb', borderRadius: 6, fontSize: 16, cursor: 'pointer', padding: '0 8px', height: 36, alignSelf: 'center' }}
            onClick={openEditCategories}
            title="Edit categories/colors"
          >✏️</button>
        </div>
        {editCategories && (
          <div
            style={{ background: '#fffbe8', border: '1.5px solid #f4a261', borderRadius: 8, padding: 8, marginBottom: 8 }}
            onMouseDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
          >
            <b>Edit Categories</b>
            {pendingCategories.map((cat, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', margin: '6px 0' }}>
                <input
                  type="color"
                  value={cat.color}
                  onChange={e => handlePendingCategoryColorChange(idx, e.target.value)}
                  style={{ width: 38, height: 38, border: 'none', marginRight: 12, background: 'none', cursor: 'pointer' }}
                  onMouseDown={e => e.stopPropagation()}
                  onClick={e => e.stopPropagation()}
                />
                <input
                  type="text"
                  value={cat.label}
                  onChange={e => handlePendingCategoryLabelChange(idx, e.target.value)}
                  style={{ fontSize: 16, borderRadius: 4, border: '1px solid #ccc', padding: '4px 10px', marginRight: 8 }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={applyCategoryChanges} style={{ background: '#44bba4', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, cursor: 'pointer' }}>Apply</button>
              <button onClick={cancelCategoryChanges} style={{ background: '#bbb', color: '#333', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}
        <div
          className="sticky-note-real editing writing"
          style={{
            top: 0,
            left: 0,
            background: categories[selectedColorIdx].color,
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
            placeholder={`Write your note...\nCategory: ${categories[selectedColorIdx].label}`}
            rows={6}
            className="sticky-note-input"
            style={{
              fontFamily: 'Patrick Hand, Comic Sans MS, cursive, sans-serif',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              width: '100%',
              height: '100%',
              resize: 'none',
              fontSize: '1.15em',
              color: getContrastColor(categories[selectedColorIdx].color),
              padding: '1em 1em 1.5em 1em',
              fontWeight: 700, // Make font bold to match board
            }}
            autoFocus
          />
        </div>
        <div style={{ display: 'none' }} id="sticky-note-drop-helper" onDrop={handleDropToBoard} />
      </div>
    </div>
  );
};

export default StickyNotePad;
