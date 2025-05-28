import React, { useState, useEffect } from 'react';
import { auth } from '../js/firebase-init.js';
import { signOut } from 'firebase/auth';
import ProfileEditSection from './ProfileEditSection.jsx';
import NatureSVG from './NatureSVG.jsx';
import AvatarEditor from './AvatarEditor.jsx';

const dicebearStyles = [
  'adventurer', 'avataaars', 'bottts', 'croodles', 'identicon', 'micah', 'miniavs', 'open-peeps', 'personas', 'pixel-art', 'pixel-art-neutral'
];

const stickyColors = [
  '#ffe082',  '#ffd1dc',  '#b3e5fc',  '#dcedc8',  '#e1bee7',
];

const stickyNotes = [
  { color: stickyColors[0], left: 0, top: 0, rotate: -7, z: 1 },
  { color: stickyColors[1], right: 0, top: 30, rotate: 8, z: 2 },
  { color: stickyColors[2], left: 60, top: 80, rotate: -10, z: 1 },
  { color: stickyColors[3], right: 60, top: 120, rotate: 6, z: 2 },
];

const Header = ({ onShowShowroom }) => {
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [avatarStyle, setAvatarStyle] = useState(() => localStorage.getItem('sticky_avatar_style') || 'adventurer');
  const [avatarSeed, setAvatarSeed] = useState(() => {
    const val = localStorage.getItem('sticky_avatar_seed');
    // Default to 1 if not a valid number
    return val && !isNaN(Number(val)) ? val : '1';
  });
  const [lastAvatarChange, setLastAvatarChange] = useState(Date.now());
  const [pendingSeed, setPendingSeed] = useState(avatarSeed);
  const [sliderTimeout, setSliderTimeout] = useState(null);
  const [showAvatarEdit, setShowAvatarEdit] = useState(false);
  const [flipCount, setFlipCount] = useState(() => Number(localStorage.getItem('sticky_avatar_flip_count') || 0));
  const [showNature, setShowNature] = useState(false);
  const [natureAnim, setNatureAnim] = useState(false);
  const [natureKey, setNatureKey] = useState(0); // for replaying animation

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('sticky_avatar_style', avatarStyle);
    localStorage.setItem('sticky_avatar_seed', avatarSeed);
    localStorage.setItem('sticky_avatar_flip_count', flipCount);
  }, [avatarStyle, avatarSeed, flipCount]);

  useEffect(() => {
    setPendingSeed(avatarSeed);
  }, [avatarSeed]);

  const handleSignOut = async () => {
    await signOut(auth);
    setShowProfile(false);
  };

  // DiceBear avatar URL
  const avatarUrl = `https://api.dicebear.com/8.x/${avatarStyle}/svg?seed=${encodeURIComponent(avatarSeed)}`;

  // Get avatar background from localStorage or default
  const avatarBg = localStorage.getItem('sticky_avatar_bg') || '#fffbe8';

  return (
    <header style={{ position: 'relative', marginBottom: '2.5em', minHeight: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {/* Fun sticky notes background, none under the title */}
      {stickyNotes.filter(note => note.right === undefined).map((note, i) => (
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
            top: note.top,
            zIndex: note.z,
            transform: `rotate(${note.rotate}deg)${note.translateX ? ` translateX(${note.translateX})` : ''}`,
            opacity: 0.85,
          }}
          aria-hidden="true"
        />
      ))}
      {/* Optionally render NatureSVG here if needed */}
      {/* <NatureSVG /> */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <h1
            style={{
              fontFamily: 'Patrick Hand, Comic Sans MS, cursive, sans-serif',
              fontSize: '2.3em',
              color: '#4d2600',
              background: '#ffe082',
              border: '3.5px solid #f4a261',
              borderRadius: '12px',
              boxShadow: '0 6px 20px #f4a26144, 0 2px 0 #fffbe8 inset',
              padding: '0.32em 1.3em',
              margin: '0 auto 0.2em auto',
              display: 'inline-block',
              position: 'relative',
              zIndex: 10,
              letterSpacing: '1.1px',
              textShadow: '1px 2px 0 #fffbe8, 2px 4px 8px #f4a26144',
              transform: 'none',
              animation: 'header-bounce 1.2s',
              cursor: 'pointer',
              userSelect: 'none',
            }}
            tabIndex={0}
            title="Welcome to The Sticky Note Project!"
          >
            The Sticky Note Project
          </h1>
        </div>
        {user && (
          <div style={{ position: 'absolute', right: '4em', top: 0, zIndex: 20 }}>
            <button
              onClick={() => setShowProfile((v) => !v)}
              style={{
                background: 'linear-gradient(120deg, #b3e5fc 85%, #e1bee7 100%)',
                border: '3px dashed #4fc3f7',
                borderRadius: '16px 18px 14px 20px/20px 14px 18px 16px',
                fontFamily: 'Patrick Hand, Comic Sans MS, cursive, sans-serif',
                fontSize: '1.1em',
                color: '#283593',
                padding: '0.5em 1.2em',
                marginLeft: 16,
                cursor: 'pointer',
                boxShadow: '0 4px 18px #4fc3f799, 0 2px 0 #fffbe8 inset',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                minWidth: 0,
                outline: '2.5px solid #e1bee7',
                outlineOffset: '2px',
                opacity: 1,
                transform: 'none',
                transition: 'box-shadow 0.2s, border 0.2s, background 0.2s',
              }}
              aria-label="Profile menu"
            >
              <img src={avatarUrl} alt="avatar" style={{ 
                width: 36, 
                height: 36, 
                borderRadius: '50%', 
                marginRight: 6, 
                background: avatarBg, 
                border: '2px solid #f4a261', 
                boxShadow: '0 2px 8px #f4a26144', 
                minHeight: 36, 
                minWidth: 36, 
                opacity: 1, 
                transition: 'opacity 0.2s',
                transform: `scale(${localStorage.getItem('sticky_avatar_scale') || 1}) scaleX(${localStorage.getItem('sticky_avatar_flip') === 'true' ? -1 : 1})`,
              }} />
              <span style={{ fontWeight: 600, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.displayName || user.email?.split('@')[0] || 'User'}</span>
            </button>
            {showProfile && (
              <div className="profile-dropdown-box" style={{
                position: 'absolute', right: 0, top: 48,
                background: 'linear-gradient(135deg, #fffbe8 80%, #ffe082 100%)',
                border: '3px solid #f4a261',
                borderRadius: 20,
                boxShadow: '0 8px 32px #f4a26155, 0 2px 0 #fffbe8 inset, 0 0 0 4px #ffd1dc55',
                padding: '1.2em 1.7em 0.7em 1.7em',
                minWidth: 280,
                maxWidth: '90vw',
                zIndex: 100,
                fontFamily: 'Patrick Hand, Comic Sans MS, cursive, sans-serif',
                color: '#4d2600',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                transition: 'box-shadow 0.2s, border 0.2s, background 0.2s',
                outline: '2.5px solid #ffd1dc',
                outlineOffset: '2px',
                boxSizing: 'border-box',
              }}>
                <div style={{ fontWeight: 700, fontSize: '1.18em', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src={avatarUrl} alt="avatar" style={{ width: 48, height: 48, borderRadius: '50%', background: avatarBg }} />
                  {user.displayName || user.email?.split('@')[0] || 'User'}
                </div>
                <div style={{ fontSize: '0.98em', marginBottom: 12, marginLeft: 2 }}>{user.email}</div>
                <div style={{ fontWeight: 600, fontSize: '1.08em', margin: '0.7em 0 0.2em 0', width: '100%', borderBottom: '1.5px dashed #f4a261', paddingBottom: 4 }}>Avatar</div>
                <section style={{ width: '100%', margin: '0.5em 0 1em 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {/* Avatar preview (click to edit) */}
                  <div style={{ margin: '10px 0', width: '100%', display: 'flex', justifyContent: 'center', cursor: 'pointer' }} onClick={() => setShowAvatarEdit(v => !v)} title="Click to edit avatar">
                    <img
                      src={avatarUrl}
                      alt="avatar preview"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: `var(--avatar-bg, #fffbe8)`,
                        transform: `scale(var(--avatar-scale, 1)) scaleX(${Math.pow(-1, flipCount)})`,
                        border: '2px solid #f4a261',
                        boxShadow: '0 2px 8px #f4a26144',
                        minHeight: 48, minWidth: 48, opacity: 1, transition: 'opacity 0.2s'
                      }}
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = `data:image/svg+xml,%3Csvg width='48' height='48' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='48' height='48' rx='24' fill='%23ffe082'/%3E%3Ctext x='50%25' y='55%25' text-anchor='middle' font-size='18' fill='%23f4a261'%3F%3E?%3C/text%3E%3C/svg%3E`;
                      }}
                    />
                  </div>
                  {showAvatarEdit && (
                    <AvatarEditor
                      avatarStyle={avatarStyle}
                      setAvatarStyle={setAvatarStyle}
                      avatarSeed={avatarSeed}
                      setAvatarSeed={setAvatarSeed}
                      pendingSeed={pendingSeed}
                      setPendingSeed={setPendingSeed}
                      flipCount={flipCount}
                      setFlipCount={setFlipCount}
                      sliderTimeout={sliderTimeout}
                      setSliderTimeout={setSliderTimeout}
                    />
                  )}
                </section>
                <div style={{ width: '100%', borderTop: '1.5px dashed #f4a261', margin: '0.5em 0 0.2em 0' }} />
                <div style={{ fontWeight: 600, fontSize: '1.08em', margin: '1.2em 0 0.2em 0', width: '100%', borderBottom: '1.5px dashed #f4a261', paddingBottom: 4 }}>Customize Profile</div>
                <ProfileEditSection user={user} />
                <div style={{ width: '100%', borderTop: '1.5px dashed #f4a261', margin: '0.5em 0 0.2em 0' }} />
                <button
                  onClick={handleSignOut}
                  style={{
                    background: '#ffd1dc',
                    color: '#4d2600',
                    border: '1.5px solid #e57373',
                    borderRadius: 10,
                    padding: '0.5em 1.2em',
                    fontFamily: 'Patrick Hand, Comic Sans MS, cursive, sans-serif',
                    fontSize: '1em',
                    cursor: 'pointer',
                    marginTop: 4,
                    alignSelf: 'center',
                    width: '100%',
                    marginBottom: 4,
                  }}
                >
                  🚪 Sign Out
                </button>
                <button
                  onClick={() => { setShowProfile(false); if (onShowShowroom) onShowShowroom(); }}
                  style={{
                    background: '#ffe082',
                    color: '#b35c00',
                    border: '2px solid #ffd1dc',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 18,
                    padding: '10px 28px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px #ffd1dc33',
                    margin: '1.2em 0 0.5em 0',
                    width: '100%',
                    display: 'block',
                  }}
                >🏅 Showroom</button>
              </div>
            )}
          </div>
        )}
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
};

export default Header;