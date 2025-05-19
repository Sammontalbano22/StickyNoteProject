import react from 'react';
import { useState } from 'react';

const Journal = () => {
    return (
        <section id="daily-journal">
            <h2>Daily Progress Questions</h2>
            <label for="goal-select">Which goal are you reflecting on?</label>
            <select id="goal-select"><option value="">-- Select a goal --</option></select>
            <p id="daily-question">What’s one thing you did today to move toward your goal?</p>
            <textarea id="daily-answer" placeholder="Write your reflection..."></textarea>
            <button onclick="submitAnswer()">Submit</button>
        </section>
        // TODO: add button
    )
}

export default Journal;