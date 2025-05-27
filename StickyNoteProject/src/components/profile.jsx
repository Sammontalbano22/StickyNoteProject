import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../js/firebase-init';
import { getDatabase, ref, get, set } from 'firebase/database';
import { updateProfile } from 'firebase/auth';

const defaultProfile = {
  displayName: '',
  email: '',
  photoURL: '',
  bio: '',
  location: '',
  birthday: '',
};

function Profile({ user, onProfileUpdate }) {
  const [profile, setProfile] = useState({ ...defaultProfile, ...user });
  const [editing, setEditing] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState('');
  const fileInput = useRef();
  const navigate = useNavigate();
  const db = getDatabase();

  // Load custom fields from Realtime Database on mount
  useEffect(() => {
    async function loadCustomFields() {
      if (!user || !user.uid) return;
      const profileRef = ref(db, `profiles/${user.uid}`);
      const snap = await get(profileRef);
      if (snap.exists()) {
        const data = snap.val();
        setProfile(prev => ({ ...prev, ...data }));
      }
    }
    loadCustomFields();
    // eslint-disable-next-line
  }, [user && user.uid]);

  // Handle profile field changes
  const handleChange = e => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Handle image upload
  const handleImage = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new window.FileReader();
    reader.onload = ev => {
      setProfile(prev => ({ ...prev, photoURL: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // Save profile (update Auth and Realtime Database)
  const handleSave = async () => {
    try {
      const userObj = auth.currentUser;
      if (userObj) {
        // Update Auth profile (modular syntax)
        await updateProfile(userObj, {
          displayName: profile.displayName,
          photoURL: profile.photoURL,
        });
        // Save custom fields to Realtime Database
        await set(ref(db, `profiles/${userObj.uid}`), {
          bio: profile.bio,
          location: profile.location,
          birthday: profile.birthday,
        });
        setEditing(false);
        if (onProfileUpdate) onProfileUpdate(profile);
      }
    } catch (err) {
      alert('Error saving profile: ' + (err.message || err));
    }
  };

  // Password change
  const handlePasswordChange = async e => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setPwMsg('New passwords do not match.');
      return;
    }
    try {
      const userObj = auth.currentUser;
      const cred = window.firebase.auth.EmailAuthProvider.credential(
        userObj.email,
        passwords.current
      );
      await userObj.reauthenticateWithCredential(cred);
      await userObj.updatePassword(passwords.new);
      setPwMsg('Password updated!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      setPwMsg('Error: ' + (err.message || err));
    }
  };

  return (
    <div className="profile-container">
      <button onClick={() => navigate('/')} style={{ marginBottom: '1em', background: '#ffe066', color: '#4d2600', border: 'none', borderRadius: '8px', padding: '0.5em 1.2em', fontWeight: 600, cursor: 'pointer' }}>
        ← Back to Dashboard
      </button>
      <h2>My Profile</h2>
      <div className="profile-card">
        <div className="profile-image">
          <img src={profile.photoURL || '/default-profile.png'} alt="Profile" />
          {editing && (
            <input type="file" accept="image/*" ref={fileInput} onChange={handleImage} />
          )}
        </div>
        <div className="profile-fields">
          <label>Name:
            <input name="displayName" value={profile.displayName} onChange={handleChange} disabled={!editing} />
          </label>
          <label>Email:
            <input name="email" value={profile.email} disabled />
          </label>
          <label>Bio:
            <textarea name="bio" value={profile.bio} onChange={handleChange} disabled={!editing} />
          </label>
          <label>Location:
            <input name="location" value={profile.location} onChange={handleChange} disabled={!editing} />
          </label>
          <label>Birthday:
            <input name="birthday" type="date" value={profile.birthday} onChange={handleChange} disabled={!editing} />
          </label>
        </div>
      </div>
      <div className="profile-actions">
        {editing ? (
          <>
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setEditing(false)}>Cancel</button>
          </>
        ) : (
          <button onClick={() => setEditing(true)}>Edit Profile</button>
        )}
      </div>
      <form className="change-password-form" onSubmit={handlePasswordChange}>
        <h3>Change Password</h3>
        <input type="password" placeholder="Current password" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} required />
        <input type="password" placeholder="New password" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} required />
        <input type="password" placeholder="Confirm new password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} required />
        <button type="submit">Update Password</button>
        {pwMsg && <div className="pw-msg">{pwMsg}</div>}
      </form>
    </div>
  );
}

export default Profile;
