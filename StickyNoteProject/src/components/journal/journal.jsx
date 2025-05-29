// src/components/journal.jsx

import { useEffect, useState } from 'react';
import { getRandomQuestion, submitAnswer as rawSubmitAnswer } from '../js/questions.js';

function Journal() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [goal, setGoal] = useState('');

  useEffect(() => {
    setQuestion(getRandomQuestion());
  }, []);

  const handleSubmit = () => {
    // Use temporary DOM elements to bridge to raw JS logic
    const questionEl = document.createElement('div');
    const answerEl = document.createElement('textarea');
    const goalEl = document.createElement('select');

    questionEl.id = 'daily-question';
    questionEl.innerText = question;
    answerEl.id = 'daily-answer';
    answerEl.value = answer;
    goalEl.id = 'goal-select';
    goalEl.value = goal;

    document.body.appendChild(questionEl);
    document.body.appendChild(answerEl);
    document.body.appendChild(goalEl);

    rawSubmitAnswer();

    document.body.removeChild(questionEl);
    document.body.removeChild(answerEl);
    document.body.removeChild(goalEl);

    setAnswer('');
  };

  return (
    <section id="daily-journal">
      <h2>Daily Progress Questions</h2>
      <label htmlFor="goal-select">Which goal are you reflecting on?</label>
      <select
        id="goal-select"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      >
        <option value="">-- Select a goal --</option>
        <option value="Example Goal">Example Goal</option>
      </select>

      <p id="daily-question">{question}</p>
      <textarea
        id="daily-answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Write your reflection..."
      />
      <button onClick={handleSubmit}>Submit</button>
    </section>
  );
}

export default Journal;
