import React, { useState } from 'react';
import './GoalShowroom.css';

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
    <div className="goal-showroom-container">
      <h2 className="goal-showroom-title">🏅 Complete Goal Showroom</h2>
      <div className="goal-showroom-tabs">
        <button
          onClick={() => setView('pinned')}
          className={`goal-showroom-tab${view === 'pinned' ? ' active' : ''}`}
        >Pinned Goals</button>
        <button
          onClick={() => setView('all')}
          className={`goal-showroom-tab all${view === 'all' ? ' active' : ''}`}
        >All Achievements</button>
      </div>
      {view === 'pinned' ? (
        <div>
          <h3 className="goal-showroom-section-title">Pinned Goals</h3>
          {pinnedGoals.length === 0 ? (
            <div className="goal-showroom-empty">No goals pinned to your showroom yet. Pin a goal after completing it!</div>
          ) : (
            <div className="goal-showroom-goals">
              {pinnedGoals.map((goal, idx) => (
                <div
                  key={idx}
                  className="goal-showroom-goal-card"
                  style={{ background: goal.color || undefined }}
                >
                  <div className="goal-showroom-goal-title">{goal.text}</div>
                  <div className="goal-showroom-goal-category">{goal.category}</div>
                  <div className="goal-showroom-goal-date">Completed: {goal.completedAt ? new Date(goal.completedAt).toLocaleDateString() : '—'}</div>
                  <button onClick={() => onUnpin(idx)} className="goal-showroom-unpin-btn">Unpin</button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h3 className="goal-showroom-section-title">All Achievements</h3>
          {completedGoals.length === 0 ? (
            <div className="goal-showroom-empty">No completed goals yet. Finish a goal to see it here!</div>
          ) : (
            <div className="goal-showroom-goals">
              {completedGoals.map((goal, idx) => (
                <div
                  key={idx}
                  className="goal-showroom-goal-card all"
                  style={{ background: goal.color || undefined }}
                >
                  <div className="goal-showroom-goal-title">{goal.text}</div>
                  <div className="goal-showroom-goal-category">{goal.category}</div>
                  <div className="goal-showroom-goal-date">Completed: {goal.completedAt ? new Date(goal.completedAt).toLocaleDateString() : '—'}</div>
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
