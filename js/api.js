// src/js/api.js

/**
 * Helper: Sends an authenticated request to your backend.
 * @param {string} url - The endpoint URL
 * @param {string} method - HTTP method (GET, POST, DELETE, etc.)
 * @param {object} body - Optional body payload
 * @returns {Promise<any>} - Parsed JSON response
 */
async function fetchWithAuth(url, method = "GET", body = null) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Not authenticated");
  }

  const token = await user.getIdToken();

  const options = {
    method,
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
  };

  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

/**
 * Helper: Sends a non-authenticated POST request to OpenAI endpoint.
 */
async function postJSON(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

// Export all backend-related functions
window.API = {
  // Goal management
  saveGoal: async (text) => {
    const user = auth.currentUser;
    if (!user) {
      alert("❌ Not signed in — cannot save goal.");
      return { status: "error", error: "Not signed in" };
    }

    try {
      return await fetchWithAuth("http://localhost:3000/save-goal", "POST", { goal: text });
    } catch (err) {
      console.error("Error saving goal:", err);
      return { status: "error", error: err.message };
    }
  },

  getGoals: async () => {
    try {
      return await fetchWithAuth("http://localhost:3000/get-goals");
    } catch (err) {
      console.error("Error getting goals:", err);
      return { status: "error", error: err.message, goals: [] };
    }
  },

  deleteGoal: (goalId) =>
    fetchWithAuth(`http://localhost:3000/delete-goal/${goalId}`, "DELETE"),

  // Milestone management
  getMilestones: (goalId) =>
    fetchWithAuth(`http://localhost:3000/milestones/${goalId}`),

  addMilestone: (goalId, milestone) =>
    fetchWithAuth("http://localhost:3000/add-milestone", "POST", { goalId, milestone }),

  updateMilestone: (goalId, milestoneId, checked) =>
    fetchWithAuth(`http://localhost:3000/milestone/${goalId}/${milestoneId}`, "PATCH", { checked }),

  deleteMilestone: (goalId, milestoneId) =>
    fetchWithAuth(`http://localhost:3000/milestone/${goalId}/${milestoneId}`, "DELETE"),

  // Journal entries
  addEntry: (entry) =>
    fetchWithAuth("http://localhost:3000/add-entry", "POST", entry),

  getJournal: () =>
    fetchWithAuth("http://localhost:3000/journal"),

  // AI goal step suggestions
  getAISteps: (goalText) =>
    postJSON("http://localhost:3000/generate-steps", { goal: goalText }),
};
