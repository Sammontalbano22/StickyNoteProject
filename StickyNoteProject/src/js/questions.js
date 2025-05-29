// DEPRECATED: Use the React Journal component (src/components/journal/journal.jsx) or a custom React hook for questions instead of this file.
// This file is no longer used in the React app.

const questionBank = [
	"What did you do today to move toward your goal?",
	"What was the biggest challenge you faced today?",
	"How motivated did you feel today?",
	"What would you do differently tomorrow?",
	"Did you take one step toward your sticky note goal today?",
];

function getRandomQuestion() {
	const idx = Math.floor(Math.random() * questionBank.length);
	return questionBank[idx];
}

document.addEventListener("DOMContentLoaded", () => {
	document.getElementById("daily-question").innerText = getRandomQuestion();
});
function submitAnswer() {
	const answer = document.getElementById("daily-answer").value.trim();
	const question = document.getElementById("daily-question").innerText;
	const goal = document.getElementById("goal-select").value;

	if (!answer || !goal) {
		alert("⚠️ Please select a goal and write your reflection.");
		return;
	}

	const journalEntry = {
		date: new Date().toLocaleString(),
		question,
		answer,
		goal,
	};

	const existing = JSON.parse(localStorage.getItem("journalEntries")) || [];
	existing.push(journalEntry);
	localStorage.setItem("journalEntries", JSON.stringify(existing));

	alert("✅ Reflection saved under goal: " + goal);
	document.getElementById("daily-answer").value = "";
	updateProgress();
}

export { getRandomQuestion, submitAnswer };