import './HabitTracker.css';
import React, { useState, useEffect } from 'react';

const getToday = () => new Date().toISOString().split('T')[0];

const HabitTracker = () => {
  const [habit, setHabit] = useState('');
  const [mode, setMode] = useState('build'); // 'build' or 'break'
  const [daysStuck, setDaysStuck] = useState(0);
  const [days, setDays] = useState([]); // [{date, checked}]
  const [started, setStarted] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('habit-tracker-widget') || '{}');
    if (data.habit) {
      setHabit(data.habit);
      setMode(data.mode || 'build');
      setDaysStuck(data.daysStuck || 0);
      setDays(data.days || []);
      setStarted(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (started) {
      localStorage.setItem('habit-tracker-widget', JSON.stringify({ habit, mode, daysStuck, days }));
    }
  }, [habit, mode, daysStuck, days, started]);

  const handleStart = (e) => {
    e.preventDefault();
    if (!habit) return;
    setDays(Array.from({ length: daysStuck }, (_, i) => ({ date: null, checked: true })).concat([{ date: getToday(), checked: false }]));
    setStarted(true);
  };

  const handleCheck = (idx) => {
    setDays(prev => prev.map((d, i) => i === idx ? { ...d, checked: !d.checked } : d));
  };

  const handleAddDay = () => {
    setDays(prev => [...prev, { date: getToday(), checked: false }]);
  };

  const checkedCount = days.filter(d => d.checked).length;

  if (!started) {
    return (
      <div className="habit-tracker-widget">
        <h3>Habit Tracker</h3>
        <form onSubmit={handleStart} className="add-habit-form">
          <input
            type="text"
            placeholder="What habit are you trying to build or break?"
            value={habit}
            onChange={e => setHabit(e.target.value)}
            required
          />
          <select value={mode} onChange={e => setMode(e.target.value)}>
            <option value="build">Build</option>
            <option value="break">Break</option>
          </select>
          <input
            type="number"
            min="0"
            placeholder="Days stuck so far"
            value={daysStuck}
            onChange={e => setDaysStuck(Number(e.target.value))}
            style={{ width: 80 }}
            required
          />
          <button type="submit">Start</button>
        </form>
      </div>
    );
  }

  return (
    <div className="habit-tracker-widget">
      <h3>{mode === 'build' ? 'Building' : 'Breaking'}: <span style={{ color: '#f4a261' }}>{habit}</span></h3>
      <div style={{ marginBottom: '0.5rem' }}>Progress: {checkedCount} / {days.length} days</div>
      <ul>
        {days.map((d, i) => (
          <li key={i} className={d.checked ? 'done' : ''}>
            <label>
              <input
                type="checkbox"
                checked={d.checked}
                onChange={() => handleCheck(i)}
              />
              {d.date ? `Day ${i + 1} (${d.date})` : `Day ${i + 1}`}
            </label>
          </li>
        ))}
      </ul>
      <button onClick={handleAddDay}>Add Today</button>
    </div>
  );
};

export default HabitTracker;
