// src/js/api.js
import { auth } from './firebase-init.js';

async function fetchWithAuth(url, method = "GET", body = null) {
  const user = auth.currentUser || window.currentUser;
  if (!user) {
    console.warn("❌ fetchWithAuth: No current user");
    alert("❌ Not signed in — cannot save goal.");
    return { status: "error", error: "Not signed in" };
  }

  const token = await user.getIdToken();
  console.log("🔐 Using ID token:", token);

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

async function postJSON(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

export const API = {
  saveGoal: async (text) => {
    const user = auth.currentUser || window.currentUser;
    if (!user) {
      alert("❌ Not signed in — cannot save goal.");
      return { status: "error", error: "Not signed in" };
    }

    try {
      return await fetchWithAuth("http://localhost:3001/save-goal", "POST", { goal: text });
    } catch (err) {
      console.error("Error saving goal:", err);
      return { status: "error", error: err.message };
    }
  },
  getGoals: async () => {
    try {
      return await fetchWithAuth("http://localhost:3001/get-goals");
    } catch (err) {
      console.error("Error getting goals:", err);
      return { status: "error", error: err.message, goals: [] };
    }
  },
  deleteGoal: (goalId) => fetchWithAuth(`http://localhost:3001/delete-goal/${goalId}`, "DELETE"),
  getMilestones: (goalId) => fetchWithAuth(`http://localhost:3001/milestones/${goalId}`),
  addMilestone: (goalId, milestone) =>
    fetchWithAuth("http://localhost:3001/add-milestone", "POST", { goalId, milestone }),
  updateMilestone: (goalId, milestoneId, checked) =>
    fetchWithAuth(`http://localhost:3001/milestone/${goalId}/${milestoneId}`, "PATCH", { checked }),
  deleteMilestone: (goalId, milestoneId) =>
    fetchWithAuth(`http://localhost:3001/milestone/${goalId}/${milestoneId}`, "DELETE"),
  addEntry: (entry) => fetchWithAuth("http://localhost:3001/add-entry", "POST", entry),
  getJournal: () => fetchWithAuth("http://localhost:3001/journal"),
  getAISteps: (goalText) => postJSON("http://localhost:3001/generate-steps", { goal: goalText }),
};
