import React, { useState } from 'react';

const dicebearStyles = [
  'adventurer', 'avataaars', 'bottts', 'croodles', 'identicon', 'micah', 'miniavs', 'open-peeps', 'personas', 'pixel-art', 'pixel-art-neutral'
];

// TODO: Move avatar editing UI logic from header.jsx here. This is a placeholder for the avatar editor.
const AvatarEditor = ({ avatarStyle, setAvatarStyle, avatarSeed, setAvatarSeed, pendingSeed, setPendingSeed, flipCount, setFlipCount, sliderTimeout, setSliderTimeout }) => {
  return (
    <>
      {/* Avatar style picker */}
      <div style={{ margin: '10px 0', width: '100%' }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Avatar Style:</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {dicebearStyles.map(style => (
            <button
              key={style}
              onClick={() => setAvatarStyle(style)}
              style={{
                border: avatarStyle === style ? '2.5px solid #f4a261' : '1.5px solid #ccc',
                borderRadius: 10,
                padding: 2,
                background: avatarStyle === style ? '#ffe082' : '#fff',
                cursor: 'pointer',
                outline: avatarStyle === style ? '2px solid #ffd1dc' : 'none',
                boxShadow: avatarStyle === style ? '0 2px 8px #f4a26144' : 'none',
              }}
              aria-label={style}
              title={style}
            >
              <img
                src={`https://api.dicebear.com/8.x/${style}/svg?seed=${encodeURIComponent(avatarSeed)}&r=${avatarStyle === style ? avatarSeed : ''}`}
                alt={style}
                style={{ width: 36, height: 36, borderRadius: 8, background: '#fffbe8', minHeight: 36, minWidth: 36, opacity: 1, transition: 'opacity 0.2s' }}
                onError={e => {
                  e.target.onerror = null;
                  setTimeout(() => {
                    e.target.src = `https://api.dicebear.com/8.x/${style}/svg?seed=${encodeURIComponent(avatarSeed)}&r=${Math.random()}`;
                  }, 150);
                  setTimeout(() => {
                    if (!e.target.complete || e.target.naturalWidth === 0) {
                      e.target.src = `data:image/svg+xml,%3Csvg width='36' height='36' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='36' height='36' rx='8' fill='%23ffe082'/%3E%3Ctext x='50%25' y='55%25' text-anchor='middle' font-size='16' fill='%23f4a261'%3F%3E?%3C/text%3E%3C/svg%3E`;
                    }
                  }, 500);
                }}
              />
            </button>
          ))}
        </div>
      </div>
      {/* Avatar seed slider */}
      <div style={{ margin: '10px 0', width: '100%' }}>
        <label>Avatar: </label>
        <input
          type="range"
          min="1"
          max="100"
          step="1"
          value={parseInt(pendingSeed) || 1}
          onChange={e => {
            const newSeed = String(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)));
            setPendingSeed(newSeed);
            if (sliderTimeout) clearTimeout(sliderTimeout);
            setSliderTimeout(setTimeout(() => {
              setAvatarSeed(newSeed);
            }, 250));
          }}
          style={{ width: 120, verticalAlign: 'middle' }}
        />
        <span style={{ marginLeft: 10 }}>{pendingSeed}</span>
      </div>
      {/* Background color picker */}
      <div style={{ margin: '10px 0', width: '100%' }}>
        <label>Background: </label>
        <input type="color" value={localStorage.getItem('sticky_avatar_bg') || '#fffbe8'} onChange={e => {
          localStorage.setItem('sticky_avatar_bg', e.target.value);
          document.documentElement.style.setProperty('--avatar-bg', e.target.value);
        }} style={{ width: 70, height: 48, border: 'none', background: 'none', verticalAlign: 'middle', borderRadius: 8 }} />
      </div>
      {/* Flip button */}
      <div style={{ margin: '10px 0', width: '100%' }}>
        <label>Flip: </label>
        <button
          type="button"
          onClick={() => setFlipCount(f => f + 1)}
          style={{
            marginLeft: 8,
            padding: '0.3em 1em',
            borderRadius: 8,
            border: '1.5px solid #f4a261',
            background: '#ffe082',
            color: '#4d2600',
            fontFamily: 'inherit',
            fontSize: '1em',
            cursor: 'pointer',
            boxShadow: '0 1px 4px #f4a26122',
          }}
        >
          Mirror
        </button>
      </div>
    </>
  );
};

export default AvatarEditor;
