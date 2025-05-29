import React, { useState } from 'react';
import './AvatarEditor.css';

const dicebearStyles = [
  'adventurer', 'avataaars', 'bottts', 'croodles', 'identicon', 'micah', 'miniavs', 'open-peeps', 'personas', 'pixel-art', 'pixel-art-neutral'
];

// TODO: Move avatar editing UI logic from header.jsx here. This is a placeholder for the avatar editor.
const AvatarEditor = ({ avatarStyle, setAvatarStyle, avatarSeed, setAvatarSeed, pendingSeed, setPendingSeed, flipCount, setFlipCount, sliderTimeout, setSliderTimeout }) => {
  return (
    <>
      {/* Avatar style picker */}
      <div className="avatar-editor-section">
        <label className="avatar-editor-label">Avatar Style:</label>
        <div className="avatar-style-picker">
          {dicebearStyles.map(style => (
            <button
              key={style}
              onClick={() => setAvatarStyle(style)}
              className={`avatar-style-btn${avatarStyle === style ? ' selected' : ''}`}
              aria-label={style}
              title={style}
            >
              <img
                src={`https://api.dicebear.com/8.x/${style}/svg?seed=${encodeURIComponent(avatarSeed)}&r=${avatarStyle === style ? avatarSeed : ''}`}
                alt={style}
                className="avatar-style-img"
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
      <div className="avatar-editor-section">
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
          className="avatar-seed-slider"
        />
        <span className="avatar-seed-value">{pendingSeed}</span>
      </div>
      {/* Background color picker */}
      <div className="avatar-editor-section">
        <label>Background: </label>
        <input type="color" value={localStorage.getItem('sticky_avatar_bg') || '#fffbe8'} onChange={e => {
          localStorage.setItem('sticky_avatar_bg', e.target.value);
          document.documentElement.style.setProperty('--avatar-bg', e.target.value);
        }} className="avatar-bg-picker" />
      </div>
      {/* Flip button */}
      <div className="avatar-editor-section">
        <label>Flip: </label>
        <button
          type="button"
          onClick={() => setFlipCount(f => f + 1)}
          className="avatar-flip-btn"
        >
          Mirror
        </button>
      </div>
    </>
  );
};

export default AvatarEditor;
