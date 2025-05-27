import React, { useState, useEffect } from 'react';
import { auth } from '../js/firebase-init.js';
import { signOut } from 'firebase/auth';
import { updateProfile, updatePassword } from 'firebase/auth';

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

const Header = () => {
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
        {user && (
          <div style={{ position: 'absolute', right: 0, top: 0, zIndex: 20 }}>
            <button
              onClick={() => setShowProfile((v) => !v)}
              style={{
                background: '#ffe082',
                border: '2px solid #f4a261',
                borderRadius: 18,
                fontFamily: 'Patrick Hand, Comic Sans MS, cursive, sans-serif',
                fontSize: '1.1em',
                color: '#4d2600',
                padding: '0.4em 1em',
                marginLeft: 16,
                cursor: 'pointer',
                boxShadow: '0 2px 8px #f4a26144',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                minWidth: 0,
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
              <div style={{
                position: 'absolute', right: 0, top: 48,
                background: '#fffbe8',
                border: '2px solid #f4a261',
                borderRadius: 16,
                boxShadow: '0 4px 18px #f4a26122',
                padding: '1em 1.5em 0.5em 1.5em',
                minWidth: 260,
                zIndex: 100,
                fontFamily: 'Patrick Hand, Comic Sans MS, cursive, sans-serif',
                color: '#4d2600',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
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
                              setLastAvatarChange(Date.now());
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

function ProfileEditSection({ user }) {
  const [name, setName] = useState(user?.displayName || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      if (user && name && name !== user.displayName) {
        await updateProfile(user, { displayName: name });
        setMessage('Name updated!');
      }
      if (user && password) {
        await updatePassword(user, password);
        setMessage((msg) => (msg ? msg + ' Password changed!' : 'Password changed!'));
        setPassword('');
      }
    } catch (err) {
      setMessage('Error: ' + (err.message || 'Could not update profile.'));
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSave} style={{ width: '100%', margin: '10px 0 18px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <label style={{ fontWeight: 500 }}>Name:</label>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{ padding: '0.4em', borderRadius: 8, border: '1.5px solid #f4a261', fontFamily: 'inherit', fontSize: '1em', background: '#fff' }}
        placeholder="Enter your name"
      />
      <label style={{ fontWeight: 500 }}>New Password:</label>
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ padding: '0.4em', borderRadius: 8, border: '1.5px solid #f4a261', fontFamily: 'inherit', fontSize: '1em', background: '#fff' }}
        placeholder="Change password"
        autoComplete="new-password"
      />
      <button
        type="submit"
        disabled={saving}
        style={{
          marginTop: 6,
          padding: '0.5em 1.2em',
          borderRadius: 8,
          border: '1.5px solid #f4a261',
          background: '#ffd1dc',
          color: '#4d2600',
          fontFamily: 'inherit',
          fontSize: '1em',
          cursor: 'pointer',
          boxShadow: '0 1px 4px #f4a26122',
        }}
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
      {message && <div style={{ color: message.startsWith('Error') ? '#e57373' : '#388e3c', marginTop: 2, fontSize: '0.98em' }}>{message}</div>}
    </form>
  );
}

export default Header;