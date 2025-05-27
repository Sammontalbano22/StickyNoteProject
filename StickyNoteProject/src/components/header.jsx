import React, { useState, useEffect } from 'react';
import { auth } from '../js/firebase-init.js';
import { useNavigate } from 'react-router-dom';

const ProfileDropdown = ({ user }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const handleProfileClick = () => {
    navigate('/profile');
    setOpen(false);
  };
  const handleAchievementsClick = () => {
    navigate('/achievements');
    setOpen(false);
  };
  if (!user) return null;

  return (
    <div className="profile-dropdown" onMouseLeave={() => setOpen(false)}>
      <button className="profile-btn" onClick={() => setOpen(o => !o)}>
        <img
          src={user.photoURL || '/default-profile.png'}
          alt="Profile"
          className="profile-thumb"
          style={{ cursor: 'default' }}
        />
        <span className="profile-name" style={{ color: '#3a2a00', fontWeight: 600 }}>{user.displayName || user.email || 'Profile'}</span>
        <span className="profile-caret">▼</span>
      </button>
      {open && (
        <div className="profile-menu">
          <div className="profile-menu-header">
            <img src={user.photoURL || '/default-profile.png'} alt="Profile" className="profile-thumb-lg" />
            <div>
              <div className="profile-menu-name" style={{ color: '#3a2a00', fontWeight: 600 }}>{user.displayName || user.email}</div>
              <div className="profile-menu-email">{user.email}</div>
            </div>
          </div>
          <hr />
          <button className="profile-menu-link" onClick={handleProfileClick}>My Profile</button>
          <button className="profile-menu-link" onClick={handleAchievementsClick}>Achievements</button>
          <button className="profile-menu-logout" onClick={() => document.getElementById('btn-logout')?.click()}>Sign Out</button>
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    if (auth) {
      auth.onAuthStateChanged(u => setUser(u));
    }
  }, []);

  return (
    <header>
      <h1>🎯 My Long-Term Goal Board</h1>
      <div id="progress-bar">
        <div id="progress-fill"></div>
      </div>
      <button id="btn-logout" style={{ display: 'none' }}>🚪 Sign Out</button>
      <ProfileDropdown user={user} />
    </header>
  );
}

export default Header;