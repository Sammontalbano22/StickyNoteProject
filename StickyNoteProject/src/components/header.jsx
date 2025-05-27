import React from 'react';

const stickyColors = [
  '#ffe082', // yellow
  '#ffd1dc', // pink
  '#b3e5fc', // blue
  '#dcedc8', // green
  '#e1bee7', // purple
];

const stickyNotes = [
  { color: stickyColors[0], left: 0, top: 0, rotate: -7, z: 1 },
  { color: stickyColors[1], right: 0, top: 30, rotate: 8, z: 2 },
  { color: stickyColors[2], left: 60, top: 80, rotate: -10, z: 1 },
  { color: stickyColors[3], right: 60, top: 120, rotate: 6, z: 2 },
  // Removed the center sticky note to prevent overlap under the title
];

const Header = () => (
  <header style={{ position: 'relative', marginBottom: '2.5em', minHeight: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    {/* Fun sticky notes background, none under the title */}
    {stickyNotes.map((note, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          width: 90 + (i % 2) * 20,
          height: 90 + ((i + 1) % 2) * 20,
          background: note.color,
          border: '2.5px solid #f4a261',
          borderRadius: '14px 18px 12px 16px/16px 12px 18px 14px',
          boxShadow: '0 4px 18px #f4a26122, 0 2px 0 #fffbe8 inset',
          left: note.left !== undefined ? note.left : undefined,
          right: note.right !== undefined ? note.right : undefined,
          top: note.top,
          zIndex: note.z,
          transform: `rotate(${note.rotate}deg)${note.translateX ? ` translateX(${note.translateX})` : ''}`,
          opacity: 0.85,
        }}
        aria-hidden="true"
      />
    ))}
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
      <h1
        style={{
          fontFamily: 'Patrick Hand, Comic Sans MS, cursive, sans-serif',
          fontSize: '2.7em',
          color: '#4d2600',
          background: '#ffe082',
          border: '3.5px dashed #f4a261',
          borderRadius: '18px 14px 16px 12px/12px 16px 14px 18px',
          boxShadow: '0 8px 32px #f4a26144, 0 2px 0 #fffbe8 inset',
          padding: '0.4em 1.7em',
          margin: '0 auto 0.2em auto',
          display: 'inline-block',
          position: 'relative',
          zIndex: 10,
          letterSpacing: '1.5px',
          textShadow: '1px 2px 0 #fffbe8, 2px 4px 8px #f4a26144',
          transform: 'rotate(-2deg)',
          animation: 'header-bounce 1.2s',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        tabIndex={0}
        title="Welcome to The Sticky Note Project!"
      >
        <span role="img" aria-label="sticky note" style={{ marginRight: 10, fontSize: '1.1em' }}>🗒️</span>
        The Sticky Note Project
        <span role="img" aria-label="sparkles" style={{ marginLeft: 10, fontSize: '1.1em' }}>✨</span>
      </h1>
    </div>
    <button id="btn-logout" style={{ display: 'none', position: 'relative', zIndex: 10 }}>🚪 Sign Out</button>
    <style>{`
      @keyframes header-bounce {
        0% { transform: scale(0.95) rotate(-8deg); opacity: 0; }
        60% { transform: scale(1.04) rotate(-2deg); opacity: 1; }
        100% { transform: scale(1) rotate(-2deg); opacity: 1; }
      }
    `}</style>
  </header>
);

export default Header;