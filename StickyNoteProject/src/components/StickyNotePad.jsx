import React, { useState, useRef } from 'react';

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
  const textareaRef = useRef(null);

  // When user types, update the current sticky note
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

  // Edit category label
  const handleCategoryLabelChange = (idx, newLabel) => {
    const updated = categories.map((cat, i) => i === idx ? { ...cat, label: newLabel } : cat);
    setCategories(updated);
    if (onUpdateCategories) onUpdateCategories(updated);
  };

  // Edit color
  const handleCategoryColorChange = (idx, newColor) => {
    const updated = categories.map((cat, i) => i === idx ? { ...cat, color: newColor } : cat);
    setCategories(updated);
    if (onUpdateCategories) onUpdateCategories(updated);
  };

  return (
    <div style={{ background: 'transparent', boxShadow: 'none', padding: 0, margin: 0 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 8, gap: 12 }}>
        {categories.map((c, idx) => (
          <div key={c.color + c.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 8, minWidth: 60 }}>
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
          onClick={() => setEditCategories((v) => !v)}
          title="Edit categories/colors"
        >✏️</button>
      </div>
      {editCategories && (
        <div
          style={{ background: '#fffbe8', border: '1.5px solid #f4a261', borderRadius: 8, padding: 8, marginBottom: 8 }}
          onMouseDown={e => e.stopPropagation()} // Prevent parent click events
          onClick={e => e.stopPropagation()} // Prevent parent click events
        >
          <b>Edit Categories</b>
          {categories.map((cat, idx) => (
            <div key={cat.color + cat.label + idx} style={{ display: 'flex', alignItems: 'center', margin: '6px 0' }}>
              <input
                type="color"
                value={cat.color}
                onChange={e => handleCategoryColorChange(idx, e.target.value)}
                style={{ width: 38, height: 38, border: 'none', marginRight: 12, background: 'none', cursor: 'pointer' }}
                onMouseDown={e => e.stopPropagation()} // Prevent closing edit mode when clicking color picker
                onClick={e => e.stopPropagation()} // Prevent closing edit mode when clicking color picker
                onBlur={e => e.preventDefault()} // Prevent blur from closing the color picker
                tabIndex={-1} // Prevent focus loss
              />
              <input
                type="text"
                value={cat.label}
                onChange={e => handleCategoryLabelChange(idx, e.target.value)}
                style={{ fontSize: 16, borderRadius: 4, border: '1px solid #ccc', padding: '4px 10px', marginRight: 8 }}
              />
            </div>
          ))}
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
