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
  // Save pinned/completed showroom goals for logged-in users
  saveShowroom: async (pinnedGoals, completedGoals) => {
    // Always update localStorage for all users
    localStorage.setItem('pinnedGoals', JSON.stringify(pinnedGoals));
    localStorage.setItem('completedGoals', JSON.stringify(completedGoals));
    const user = auth.currentUser || window.currentUser;
    if (!user) {
      // Not signed in, just update localStorage
      return { status: 'ok', local: true };
    }
    try {
      // Save to backend
      const result = await fetchWithAuth("http://localhost:3001/save-showroom", "POST", { pinnedGoals, completedGoals });
      // Always update localStorage for redundancy (already done above)
      return result;
    } catch (err) {
      // On error, fallback to localStorage (already done above)
      console.error("Error saving showroom:", err);
      return { status: "error", error: err.message };
    }
  },
  // Get pinned/completed showroom goals for logged-in users
  getShowroom: async () => {
    const user = auth.currentUser || window.currentUser;
    let result;
    if (!user) {
      // Not signed in, load from localStorage
      result = {
        pinnedGoals: JSON.parse(localStorage.getItem('pinnedGoals') || '[]'),
        completedGoals: JSON.parse(localStorage.getItem('completedGoals') || '[]'),
        status: 'ok',
        local: true
      };
      // Always update localStorage with what we load (already from localStorage, but ensures structure)
      localStorage.setItem('pinnedGoals', JSON.stringify(result.pinnedGoals));
      localStorage.setItem('completedGoals', JSON.stringify(result.completedGoals));
      return result;
    }
    try {
      result = await fetchWithAuth("http://localhost:3001/get-showroom");
      // If backend returns empty, fallback to localStorage
      if ((!result.pinnedGoals || result.pinnedGoals.length === 0) && localStorage.getItem('pinnedGoals')) {
        result.pinnedGoals = JSON.parse(localStorage.getItem('pinnedGoals'));
      }
      if ((!result.completedGoals || result.completedGoals.length === 0) && localStorage.getItem('completedGoals')) {
        result.completedGoals = JSON.parse(localStorage.getItem('completedGoals'));
      }
      // Always update localStorage with what we load
      localStorage.setItem('pinnedGoals', JSON.stringify(result.pinnedGoals));
      localStorage.setItem('completedGoals', JSON.stringify(result.completedGoals));
      return result;
    } catch (err) {
      // On error, fallback to localStorage
      console.error("Error getting showroom:", err);
      result = {
        pinnedGoals: JSON.parse(localStorage.getItem('pinnedGoals') || '[]'),
        completedGoals: JSON.parse(localStorage.getItem('completedGoals') || '[]'),
        status: 'error',
        error: err.message,
        local: true
      };
      // Always update localStorage with what we load
      localStorage.setItem('pinnedGoals', JSON.stringify(result.pinnedGoals));
      localStorage.setItem('completedGoals', JSON.stringify(result.completedGoals));
      return result;
    }
  },
};
