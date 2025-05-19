// src/js/journal.js

/**
 * Submits a journal entry for the selected goal.
 */
async function submitAnswer() {
  const goalId = document.getElementById("goal-select").value;
  const response = document.getElementById("daily-answer").value.trim();
  const date = new Date().toISOString().split("T")[0];
  const milestone = ""; // Optional: allow milestone-specific journaling in the future

  if (!goalId || !response) {
    alert("⚠️ Please select a goal and write your reflection.");
    return;
  }

  try {
    const data = await API.addEntry({ goal: goalId, milestone, response, date });
    if (data.status === "ok") {
      alert("✅ Reflection saved!");
      document.getElementById("daily-answer").value = "";
    } else {
      alert("❌ Failed to save entry: " + data.error);
    }
  } catch (err) {
    alert("❌ Error submitting entry.");
    console.error(err);
  }
}

/**
 * Loads all journal entries and displays them below the journal section.
 */
async function loadJournal() {
  const journalSection = document.getElementById("journal-section");
  journalSection.innerHTML = "<h3>📓 Journal Entries:</h3>";

  try {
    const allEntries = await API.getJournal();
    if (!allEntries.length) {
      const msg = document.createElement("p");
      msg.textContent = "No entries yet.";
      journalSection.appendChild(msg);
      return;
    }

    allEntries.forEach(entry => {
      const item = document.createElement("div");
      item.className = "journal-entry";
      item.innerHTML = `<p><em>${entry.date}</em> — Goal: ${entry.goal}<br>${entry.response}</p>`;
      journalSection.appendChild(item);
    });
  } catch (err) {
    journalSection.innerHTML += "<p>❌ Failed to load journal entries.</p>";
    console.error(err);
  }
}

// Expose globally for HTML button use
window.submitAnswer = submitAnswer;
window.loadJournal = loadJournal;
