import React, { useState } from 'react';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

const ProfileEditSection = ({ user }) => {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [editingName, setEditingName] = useState(false);
  const [nameStatus, setNameStatus] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('');

  const handleNameSave = async () => {
    if (!displayName.trim()) return;
    try {
      await updateProfile(user, { displayName });
      setNameStatus('Name updated!');
      setEditingName(false);
      setTimeout(() => setNameStatus(''), 2000);
    } catch (e) {
      setNameStatus('Error updating name');
    }
  };

  const handlePasswordChange = async () => {
    setPasswordStatus('');
    if (!currentPassword || !newPassword) {
      setPasswordStatus('Please fill both fields');
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPasswordStatus('Password updated!');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordStatus(''), 2000);
    } catch (e) {
      setPasswordStatus('Error: ' + (e.message || 'Could not update password'));
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Display Name Edit */}
      <div style={{ margin: '0.5em 0' }}>
        <label style={{ fontWeight: 500 }}>Display Name: </label>
        {editingName ? (
          <>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              style={{ fontSize: '1em', padding: '0.2em 0.5em', borderRadius: 6, border: '1.5px solid #f4a261', marginRight: 8 }}
            />
            <button onClick={handleNameSave} style={{ marginRight: 4, borderRadius: 6, border: '1.5px solid #4fc3f7', background: '#b3e5fc', color: '#283593', fontFamily: 'inherit', fontSize: '1em', padding: '0.2em 0.8em', cursor: 'pointer' }}>Save</button>
            <button onClick={() => { setEditingName(false); setDisplayName(user.displayName || ''); }} style={{ borderRadius: 6, border: '1.5px solid #ffd1dc', background: '#ffd1dc', color: '#4d2600', fontFamily: 'inherit', fontSize: '1em', padding: '0.2em 0.8em', cursor: 'pointer' }}>Cancel</button>
          </>
        ) : (
          <>
            <span style={{ marginLeft: 8, fontWeight: 600 }}>{user.displayName || <em>None</em>}</span>
            <button onClick={() => setEditingName(true)} style={{ marginLeft: 10, borderRadius: 6, border: '1.5px solid #f4a261', background: '#ffe082', color: '#4d2600', fontFamily: 'inherit', fontSize: '1em', padding: '0.2em 0.8em', cursor: 'pointer' }}>Edit</button>
          </>
        )}
        {nameStatus && <span style={{ marginLeft: 10, color: '#388e3c', fontWeight: 500 }}>{nameStatus}</span>}
      </div>
      {/* Password Change */}
      <div style={{ margin: '0.5em 0' }}>
        <label style={{ fontWeight: 500 }}>Change Password: </label>
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Current password"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          style={{ fontSize: '1em', padding: '0.2em 0.5em', borderRadius: 6, border: '1.5px solid #f4a261', marginRight: 6, marginLeft: 4 }}
        />
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="New password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          style={{ fontSize: '1em', padding: '0.2em 0.5em', borderRadius: 6, border: '1.5px solid #f4a261', marginRight: 6 }}
        />
        <button onClick={() => setShowPassword(v => !v)} style={{ borderRadius: 6, border: '1.5px solid #b3e5fc', background: '#b3e5fc', color: '#283593', fontFamily: 'inherit', fontSize: '1em', padding: '0.2em 0.8em', cursor: 'pointer', marginRight: 4 }}>{showPassword ? 'Hide' : 'Show'}</button>
        <button onClick={handlePasswordChange} style={{ borderRadius: 6, border: '1.5px solid #f4a261', background: '#ffe082', color: '#4d2600', fontFamily: 'inherit', fontSize: '1em', padding: '0.2em 0.8em', cursor: 'pointer' }}>Update</button>
        {passwordStatus && <span style={{ marginLeft: 10, color: passwordStatus.includes('Error') ? '#e57373' : '#388e3c', fontWeight: 500 }}>{passwordStatus}</span>}
      </div>
    </div>
  );
};

export default ProfileEditSection;
