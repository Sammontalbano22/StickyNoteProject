import React, { useEffect, useState } from 'react';
import { API } from '../js/api.js';

function Goals() {
  const [goals, setGoals] = useState([]);
  const [goalInput, setGoalInput] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [milestoneInput, setMilestoneInput] = useState('');
  const [milestones, setMilestones] = useState([]);
  const [aiSuggestions, setAISuggestions] = useState([]);
  const [aiLoading, setAILoading] = useState(false);
  const [aiError, setAIError] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  async function loadGoals() {
    try {
      const data = await API.getGoals();
      setGoals(data.goals || []);
    } catch (err) {
      setGoals([]);
    }
  }

  async function addGoal() {
    if (!goalInput.trim()) return;
    const data = await API.saveGoal(goalInput.trim());
    if (data.status === 'ok') {
      setGoalInput('');
      loadGoals();
    }
  }

  async function addMilestone() {
    if (!selectedGoal || !milestoneInput.trim()) return;
    await API.addMilestone(selectedGoal, milestoneInput.trim());
    setMilestoneInput('');
    loadMilestones(selectedGoal);
  }

  async function loadMilestones(goalId) {
    if (!goalId) return setMilestones([]);
    const data = await API.getMilestones(goalId);
    setMilestones(data.milestones || []);
  }

  useEffect(() => {
    if (selectedGoal) loadMilestones(selectedGoal);
    else setMilestones([]);
  }, [selectedGoal]);

  async function fetchAISteps(goalText) {
    setAILoading(true);
    setAIError('');
    try {
      const res = await API.getAISteps(goalText);
      setAISuggestions(res.steps || []);
    } catch (err) {
      setAIError('Failed to fetch AI suggestions.');
      setAISuggestions([]);
    }
    setAILoading(false);
  }

  function handleGetAISteps() {
    const goalObj = goals.find(g => g.id === selectedGoal);
    if (goalObj) fetchAISteps(goalObj.text);
  }

  async function acceptAIStep(step) {
    if (!selectedGoal) return;
    await API.addMilestone(selectedGoal, step);
    loadMilestones(selectedGoal);
    setAISuggestions(aiSuggestions.filter(s => s !== step));
  }

  function rejectAIStep(step) {
    setAISuggestions(aiSuggestions.filter(s => s !== step));
  }

  return (
    <>
      <section id="goal-creator">
        <h2>Write a New Goal</h2>
        <div className="note-pad">
          <textarea id="goal-input" value={goalInput} onChange={e => setGoalInput(e.target.value)} placeholder="Write your sticky goal here..." />
        </div>
        <button onClick={addGoal}>📌 Pin Goal</button>
      </section>

      <section id="goal-board">
        <h2>Pinned Goals</h2>
        <div id="sticky-board">
          {goals.map(goal => (
            <div key={goal.id} className={`sticky-note${goal.complete ? ' complete-goal' : ''}`}>{goal.text}</div>
          ))}
        </div>
      </section>

      <section id="milestones">
        <h2>Milestone Tracker</h2>
        <ul id="milestone-list">
          {milestones.map(m => (
            <li key={m.id} className={m.done ? 'done' : ''}>
              <input type="checkbox" checked={m.done} readOnly />
              {m.text}
              <span className="delete-btn" title="Delete">🗑️</span>
            </li>
          ))}
        </ul>
        <label htmlFor="milestone-goal-select">Attach to goal:</label>
        <select id="milestone-goal-select" value={selectedGoal} onChange={e => setSelectedGoal(e.target.value)}>
          <option value="">-- Select a goal --</option>
          {goals.map(goal => (
            <option key={goal.id} value={goal.id}>{goal.text}</option>
          ))}
        </select>
        <input id="milestone-input" value={milestoneInput} onChange={e => setMilestoneInput(e.target.value)} placeholder="Add milestone..." />
        <button onClick={addMilestone}>Add</button>

        <button onClick={handleGetAISteps} disabled={!selectedGoal || aiLoading}>
          {aiLoading ? 'Loading AI Suggestions...' : 'Get AI Suggestions'}
        </button>
        {aiError && <p style={{ color: 'red' }}>{aiError}</p>}
        {aiSuggestions.length > 0 && (
          <div id="suggestions">
            <h2>AI Suggested Steps</h2>
            {aiSuggestions.map((step, idx) => (
              <div className="suggestion suggested-step" key={idx}>
                <p>{step}</p>
                <button className="accept" onClick={() => acceptAIStep(step)}>Accept</button>
                <button className="reject" onClick={() => rejectAIStep(step)}>Reject</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default Goals;
