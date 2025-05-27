import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Achievements.css';

function Achievements() {
  const [stats, setStats] = useState({
    goals: 0,
    milestones: 0,
    aiAccepted: 0,
    journalEntries: 0,
    goalsPinned: 0, // New tracker
  });
  const navigate = useNavigate();

  useEffect(() => {
    // You can replace this with backend fetch if needed
    let goals = 0, milestones = 0, aiAccepted = 0, journalEntries = 0, goalsPinned = 0;
    try {
      const goalsRaw = JSON.parse(localStorage.getItem('goals')) || [];
      goals = goalsRaw.length;
      milestones = goalsRaw.reduce((sum, g) => sum + (g.milestones?.length || 0), 0);
      aiAccepted = parseInt(localStorage.getItem('aiAccepted') || '0', 10);
      journalEntries = (JSON.parse(localStorage.getItem('journalEntries')) || []).length;
      goalsPinned = parseInt(localStorage.getItem('goalsPinned') || '0', 10);
    } catch {}
    setStats({ goals, milestones, aiAccepted, journalEntries, goalsPinned });
  }, []);

  function popAnim(e) {
    if (!e) return;
    e.target.classList.add('pop-anim');
    setTimeout(() => e.target.classList.remove('pop-anim'), 400);
  }

  return (
    <div className="profile-achievements">
      <button
        style={{
          marginBottom: '1.2rem',
          background: '#ffe066',
          border: 'none',
          borderRadius: '8px',
          padding: '0.6rem 1.2rem',
          fontWeight: 600,
          fontFamily: 'Patrick Hand, cursive',
          fontSize: '1.1rem',
          color: '#3a2a00',
          cursor: 'pointer',
          boxShadow: '0 2px 8px #ffe06655',
          transition: 'background 0.15s, transform 0.13s',
        }}
        onClick={() => navigate('/')}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        ← Back to Dashboard
      </button>
      <h3>🏆 Achievements & Trackers</h3>
      <div className="tracker-grid">
        <div className="tracker-card" onClick={popAnim} title="Total goals created">
          <span className="tracker-icon">🎯</span>
          <span className="tracker-label">Goals Achieved</span>
          <span className="tracker-value">{stats.goals}</span>
        </div>
        <div className="tracker-card" onClick={popAnim} title="Milestones completed">
          <span className="tracker-icon">📌</span>
          <span className="tracker-label">Milestones Made</span>
          <span className="tracker-value">{stats.milestones}</span>
        </div>
        <div className="tracker-card" onClick={popAnim} title="AI suggestions accepted">
          <span className="tracker-icon">🤖</span>
          <span className="tracker-label">AI Chats Accepted</span>
          <span className="tracker-value">{stats.aiAccepted}</span>
        </div>
        <div className="tracker-card" onClick={popAnim} title="Journal entries written">
          <span className="tracker-icon">📖</span>
          <span className="tracker-label">Journal Entries</span>
          <span className="tracker-value">{stats.journalEntries}</span>
        </div>
        <div className="tracker-card">
          <span className="tracker-icon">📌</span>
          <span className="tracker-label">Goals Pinned</span>
          <span className="tracker-value" id="goals-pinned-value">{stats.goalsPinned}</span>
        </div>
      </div>
      <div className="tracker-tip">🔥 Keep going! Unlock more by using the app daily.</div>
    </div>
  );
}

export default Achievements;
