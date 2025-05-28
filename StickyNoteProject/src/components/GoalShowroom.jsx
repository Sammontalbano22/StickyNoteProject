import React, { useState } from 'react';

/**
 * GoalShowroom displays pinned (showcased) sticky notes and all completed achievements.
 * Props:
 *   pinnedGoals: array of goal objects (pinned by user)
 *   completedGoals: array of all completed goal objects
 *   onUnpin: function(idx) to unpin a goal
 */
const GoalShowroom = ({ pinnedGoals, completedGoals, onUnpin }) => {
  const [view, setView] = useState('pinned'); // 'pinned' or 'all'

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ fontFamily: 'Patrick Hand, Comic Sans MS, cursive', color: '#4d2600', marginBottom: 18, fontSize: 32 }}>🏅 Complete Goal Showroom</h2>
      <div style={{ display: 'flex', gap: 18, marginBottom: 24 }}>
        <button
          onClick={() => setView('pinned')}
          style={{ background: view === 'pinned' ? '#ffe082' : '#fff', color: '#b35c00', border: '2px solid #ffd1dc', borderRadius: 8, fontWeight: 700, fontSize: 18, padding: '8px 24px', cursor: 'pointer' }}
        >Pinned Goals</button>
        <button
          onClick={() => setView('all')}
          style={{ background: view === 'all' ? '#ffd1dc' : '#fff', color: '#4d2600', border: '2px solid #ffe082', borderRadius: 8, fontWeight: 700, fontSize: 18, padding: '8px 24px', cursor: 'pointer' }}
        >All Achievements</button>
      </div>
      {view === 'pinned' ? (
        <div>
          <h3 style={{ color: '#b35c00', marginBottom: 12 }}>Pinned Goals</h3>
          {pinnedGoals.length === 0 ? (
            <div style={{ color: '#888', fontStyle: 'italic', marginBottom: 24 }}>No goals pinned to your showroom yet. Pin a goal after completing it!</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
              {pinnedGoals.map((goal, idx) => (
                <div key={idx} style={{ background: goal.color || '#ffe082', color: '#4d2600', borderRadius: 18, boxShadow: '0 4px 18px #f4a26133', padding: 24, minWidth: 220, maxWidth: 320, marginBottom: 12, position: 'relative' }}>
                  <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>{goal.text}</div>
                  <div style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>{goal.category}</div>
                  <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>Completed: {goal.completedAt ? new Date(goal.completedAt).toLocaleDateString() : '—'}</div>
                  <button onClick={() => onUnpin(idx)} style={{ position: 'absolute', top: 8, right: 8, background: '#ffd1dc', color: '#b35c00', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, padding: '4px 12px', cursor: 'pointer' }}>Unpin</button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h3 style={{ color: '#b35c00', marginBottom: 12 }}>All Achievements</h3>
          {completedGoals.length === 0 ? (
            <div style={{ color: '#888', fontStyle: 'italic', marginBottom: 24 }}>No completed goals yet. Finish a goal to see it here!</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
              {completedGoals.map((goal, idx) => (
                <div key={idx} style={{ background: goal.color || '#b3e5fc', color: '#4d2600', borderRadius: 18, boxShadow: '0 4px 18px #b3e5fc33', padding: 24, minWidth: 220, maxWidth: 320, marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>{goal.text}</div>
                  <div style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>{goal.category}</div>
                  <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>Completed: {goal.completedAt ? new Date(goal.completedAt).toLocaleDateString() : '—'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GoalShowroom;
