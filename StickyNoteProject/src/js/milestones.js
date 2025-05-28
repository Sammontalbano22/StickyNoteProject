// src/js/milestones.js

import { auth } from './firebase-init.js';
import { API } from './api.js';

// Add a new goal
async function addGoal() {
  const input = document.getElementById("goal-input");
  const text = input.value.trim();
  if (!text) return;

  const data = await API.saveGoal(text);
  if (data.status === "ok") {
    input.value = "";
    loadGoals();
    API.getAISteps(text).then(result => {
      displayAISteps(result.steps, text);
    });
  } else {
    alert("❌ Failed to save goal: " + data.error);
  }
}

async function loadGoals() {
  const user = auth.currentUser;
  if (!user) {
    console.warn("User not authenticated. Skipping goal load.");
    return;
  }

  const board = document.getElementById("sticky-board");
  const dropdown = document.getElementById("goal-select");
  const milestoneDropdown = document.getElementById("milestone-goal-select");

  board.innerHTML = '';
  dropdown.innerHTML = '<option value="">-- Select a goal --</option>';
  milestoneDropdown.innerHTML = '<option value="">-- Select a goal --</option>';
  document.getElementById("milestone-list").innerHTML = '';

  const goalData = await API.getGoals();
  if (!goalData.goals || goalData.goals.length === 0) {
    console.log("No goals found for this user.");
    return;
  }

  for (const goal of goalData.goals) {
    renderGoalCard(goal, board);
    addDropdownOption(goal, dropdown);
    addDropdownOption(goal, milestoneDropdown);

    const milestoneData = await API.getMilestones(goal.id);
    milestoneData.milestones.forEach(m =>
      renderMilestone(m.text, goal.id, m.checked, m.id)
    );

    updateGoalProgress(goal.id);
  }
}

function renderGoalCard(goal, container) {
  const flipContainer = document.createElement("div");
  flipContainer.className = "flip-container";

  const flipCard = document.createElement("div");
  flipCard.className = "flip-card";

  const front = document.createElement("div");
  front.className = "card-front sticky-note";
  front.dataset.goalId = goal.id;
  front.innerText = goal.text;

  const progressBar = document.createElement("div");
  progressBar.className = "goal-progress";
  progressBar.innerHTML = `<div class="goal-progress-fill" id="progress-${goal.id}"></div>`;
  front.appendChild(progressBar);

  const deleteBtn = document.createElement("span");
  deleteBtn.textContent = "🗑️";
  deleteBtn.className = "delete-btn";
  deleteBtn.onclick = async e => {
    e.stopPropagation();
    const data = await API.deleteGoal(goal.id);
    if (data.status === "ok") {
      flipContainer.remove();
    } else {
      alert("❌ Failed to delete goal: " + data.error);
    }
  };
  front.appendChild(deleteBtn);

  const back = document.createElement("div");
  back.className = "card-back";
  back.innerHTML = `<strong>Loading...</strong>`;

  front.onclick = () => {
    flipContainer.classList.add("flipped");
    flipCard.classList.add("fullscreen");
    back.classList.add("fullscreen-back");
    setTimeout(() => loadCardBack(back, goal.id), 500);
  };

  back.onclick = () => {
    flipContainer.classList.remove("flipped");
    flipCard.classList.remove("fullscreen");
    back.classList.remove("fullscreen-back");
  };

  flipCard.appendChild(front);
  flipCard.appendChild(back);
  flipContainer.appendChild(flipCard);
  container.appendChild(flipContainer);
}

function addDropdownOption(goal, dropdown) {
  const option = document.createElement("option");
  option.value = goal.id;
  option.textContent = goal.text;
  dropdown.appendChild(option);
}

function displayAISteps(steps, goalText) {
  const suggestionsDiv = document.getElementById("suggested-goals");
  suggestionsDiv.innerHTML = "";
  if (!steps || steps.length === 0) {
    suggestionsDiv.innerText = "❌ No suggestions.";
    return;
  }

  steps.forEach(step => {
    const div = document.createElement("div");
    div.className = "suggested-step";
    div.innerHTML = `
      ${step}
      <button onclick="acceptStep('${step.replace(/'/g, "\\'")}', this)">✅ Accept</button>
      <button onclick="rejectStep(this)">❌ Reject</button>`;
    suggestionsDiv.appendChild(div);
  });
}

function updateGoalProgress(goalId) {
  const milestones = [...document.querySelectorAll(`#milestone-list li[data-goal-id="${goalId}"]`)];
  const total = milestones.length;
  const completed = milestones.filter(m => m.querySelector('input[type=checkbox]').checked).length;
  const percent = total > 0 ? (completed / total) * 100 : 0;

  const progressFill = document.getElementById(`progress-${goalId}`);
  if (progressFill) {
    progressFill.style.width = `${percent}%`;
  }

  const notes = document.querySelectorAll(`.sticky-note[data-goal-id="${goalId}"]`);
  notes.forEach(note => {
    note.classList.toggle("complete-goal", completed === total && total > 0);
    if (completed === total && total > 0) triggerConfetti();
  });
}

async function loadCardBack(container, goalId) {
  container.innerHTML = "";
  const inner = document.createElement("div");
  inner.style.transform = "scaleX(-1)";
  inner.style.width = "100%";

  const backButton = document.createElement("button");
  backButton.textContent = "🔙 Back";
  backButton.onclick = () => {
    const flipContainer = container.closest(".flip-container");
    flipContainer.classList.remove("flipped");
    container.classList.remove("fullscreen-back");
  };
  inner.appendChild(backButton);

  const milestoneData = await API.getMilestones(goalId);
  const milestoneSection = document.createElement("div");
  milestoneSection.innerHTML = "<h3>🛠 Milestones:</h3>";
  milestoneData.milestones.forEach(m => {
    const item = document.createElement("div");
    item.textContent = `${m.checked ? "✅" : "⬜"} ${m.text}`;
    milestoneSection.appendChild(item);
  });
  inner.appendChild(milestoneSection);

  const allEntries = await API.getJournal();
  const entriesForGoal = allEntries.filter(e => e.goal === goalId);
  const journalSection = document.createElement("div");
  journalSection.innerHTML = "<h3>📓 Journal Entries:</h3>";
  if (entriesForGoal.length === 0) {
    const noEntry = document.createElement("p");
    noEntry.textContent = "No entries yet.";
    journalSection.appendChild(noEntry);
  } else {
    entriesForGoal.forEach(entry => {
      const item = document.createElement("div");
      item.className = "journal-entry";
      item.innerHTML = `<p><em>${entry.date}</em>: ${entry.response}</p>`;
      journalSection.appendChild(item);
    });
  }
  inner.appendChild(journalSection);

  container.appendChild(inner);
}

// Accept a suggested step and add it as a milestone for the selected goal
async function acceptStep(step, btn) {
  const goalId = document.getElementById("goal-select").value;
  if (!goalId) {
    alert("⚠️ Please select a goal first.");
    return;
  }
  try {
    const data = await API.addMilestone(goalId, step);
    if (data.status === "ok") {
      btn.parentElement.remove(); // Remove the suggestion from the UI
      loadGoals(); // Refresh milestones
    } else {
      alert("❌ Failed to add milestone: " + data.error);
    }
  } catch (err) {
    alert("❌ Error adding milestone.");
    console.error(err);
  }
}

// Expose globally
window.addGoal = addGoal;
window.loadGoals = loadGoals;
window.acceptStep = acceptStep;
window.rejectStep = rejectStep;
window.loadCardBack = loadCardBack;
window.updateGoalProgress = updateGoalProgress;

export {
  addGoal,
  loadGoals,
  updateGoalProgress,
  displayAISteps,
  loadCardBack
};
