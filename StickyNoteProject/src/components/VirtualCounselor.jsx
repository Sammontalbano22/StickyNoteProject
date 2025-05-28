import { useState, useRef } from 'react';
import CounselorDrawing from './CounselorDrawing.jsx';

/**
 * VirtualCounselor: A virtual advisor for goal setting and achievement.
 * Provides chat-based advice, encouragement, and actionable steps.
 */
const COUNSELOR_NAME = "Coach Sage";
const COUNSELOR_AVATAR = "🧑‍🏫";

const defaultPrompts = [
  "How can I set a realistic goal?",
  "What should I do if I feel stuck on my goal?",
  "How do I break a big goal into smaller steps?",
  "How can I stay motivated to achieve my goals?",
  "Give me advice for overcoming procrastination."
];

const initialMessages = [
  {
    sender: COUNSELOR_NAME,
    text: "Hi! I'm your virtual life counselor. Ask me anything about goal setting, motivation, or overcoming obstacles!"
  }
];

const exampleReplies = [
  // Goal setting
  "Setting a realistic goal is a powerful first step! Start by thinking about what truly matters to you and why you want to achieve it. Make your goal specific and measurable—something you can clearly define and track. For example, instead of 'I want to be healthier,' try 'I want to walk 30 minutes every day.' Remember, it's okay to start small. What is one thing you could do this week to move closer to your goal?",
  // Feeling stuck
  "It's completely normal to feel stuck or blocked sometimes—you're not alone in this! When you hit a wall, take a deep breath and give yourself permission to pause. Try breaking your goal into smaller, bite-sized steps, and celebrate each small win along the way. Sometimes, talking it out or writing down your thoughts can help you see things from a new perspective. What do you think is the biggest obstacle right now? Let's work through it together.",
  // Breaking down big goals
  "Big goals can feel overwhelming, but you have the strength to tackle them! Start by imagining the end result, then work backward: what are the major milestones along the way? Break each milestone into smaller, manageable tasks. Focus on one step at a time, and don't forget to acknowledge your progress. Remember, every journey is made up of many small steps. Which part of your goal feels the hardest to start?",
  // Motivation
  "Motivation can ebb and flow, and that's perfectly normal. The key is to build habits and routines that support your goal, even on days when motivation is low. Remind yourself why this goal matters to you—write it down and keep it visible. Celebrate your progress, no matter how small, and be kind to yourself if you slip up. What inspired you to pursue this goal in the first place? Let's reconnect with that spark.",
  // Procrastination
  "Procrastination is something everyone faces at times, so be gentle with yourself. Try setting a timer for just 10 minutes and commit to starting—often, getting started is the hardest part. Break your task into the smallest possible step and focus only on that. If you feel overwhelmed, take a short walk or do a quick breathing exercise to reset. What is one tiny action you could take right now to move forward? I'm here to support you every step of the way."
];

function getCounselorReply(userMsg) {
  // In a real app, call an AI API here. For now, use canned responses.
  if (/procrastinat/i.test(userMsg)) return exampleReplies[4];
  if (/motivat/i.test(userMsg)) return exampleReplies[3];
  if (/stuck|blocked|can't/i.test(userMsg)) return exampleReplies[1];
  if (/break|step|milestone/i.test(userMsg)) return exampleReplies[2];
  if (/goal|set/i.test(userMsg)) return exampleReplies[0];
  return "That's a great question! Can you tell me more about your goal or what's challenging you?";
}

const VirtualCounselor = ({
  onCreateGoal, onAddMilestone, onPinGoal, onUnpinGoal, onShowPinned, onShowCompleted,
  onAddWidget, onListWidgets, onDeleteWidget, onOpenHabitTracker, onShowProgress, onOpenShowroom,
  onOpenJournal, onAddJournalEntry, onAddQuoteWidget, onAddPlaylistWidget, onAddImageWidget,
  goals = [], pinnedGoals = [], completedGoals = [], getProgress, coachPersona = 'cheerleader'
}) => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [showPrompts, setShowPrompts] = useState(true);
  // Add new state for widget/journal flows
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingInput, setPendingInput] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [coachMode, setCoachMode] = useState(false);
  const [lastGoal, setLastGoal] = useState(null);
  const [lastMilestone, setLastMilestone] = useState(null);
  const [lastHabit, setLastHabit] = useState(null);
  const checkinTimer = useRef(null);

  // Helper: get a friendly list of goals
  function getGoalList(goalsArr) {
    if (!goalsArr || !goalsArr.length) return 'No goals yet.';
    return goalsArr.map((g, i) => `${i + 1}. ${g.text}`).join(' | ');
  }

  // Helper: personalized encouragement
  function encouragement(goal) {
    const phrases = [
      `You're making real progress on "${goal}"! Keep it up!`,
      `Remember why you started "${goal}". Every step counts!`,
      `Visualize your success with "${goal}"—you're closer than you think.`,
      `Setbacks are part of the journey. Stay patient with "${goal}".`
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  // Helper: proactive check-in
  function scheduleCheckin() {
    if (coachMode && !checkinTimer.current) {
      checkinTimer.current = setTimeout(() => {
        setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: `Coach check-in: How are you doing on your current goal? Need help breaking it down or staying motivated?` }]);
        checkinTimer.current = null;
      }, 1000 * 60 * 10); // 10 minutes for demo
    }
  }

  // Helper: deeper milestone breakdown
  function suggestMilestoneBreakdown(milestone) {
    return [
      `What is the very first action you need to take for "${milestone}"?`,
      `Can you set a deadline for "${milestone}"?`,
      `Who could support or hold you accountable for "${milestone}"?`,
      `What might get in the way of "${milestone}" and how will you handle it?`
    ];
  }

  // Helper: habit/reflective prompt
  function reflectivePrompt() {
    const prompts = [
      'What went well for you this week?',
      'What was your biggest challenge and how did you respond?',
      'What is one thing you can do differently next week?',
      'How did you celebrate your progress?',
      'What are you grateful for on your journey?'
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  // Expanded intent detection (add coach mode, check-in, reflection, etc)
  function detectAction(msg) {
    if (/coach mode|accountability|check[- ]?in/i.test(msg)) return 'coach-mode';
    if (/encourage|motivate|cheer/i.test(msg)) return 'encourage';
    if (/reflect|journal|prompt/i.test(msg)) return 'reflect';
    if (/break.*milestone|step.*milestone|how.*milestone/i.test(msg)) return 'breakdown-milestone';
    if (/help|what can you do|commands|features/i.test(msg)) return 'help';
    if (/add.*milestone|milestone.*add|step.*add|add.*step/i.test(msg)) return 'add-milestone';
    if (/new goal|create goal|set goal|start goal|goal.*create/i.test(msg)) return 'create-goal';
    if (/pin goal|mount goal|showroom/i.test(msg)) return 'pin-goal';
    if (/unpin goal|remove.*showroom/i.test(msg)) return 'unpin-goal';
    if (/show.*pinned|show.*showroom/i.test(msg)) return 'show-pinned';
    if (/show.*completed/i.test(msg)) return 'show-completed';
    if (/add widget|new widget|playlist|image widget/i.test(msg)) return 'add-widget';
    if (/list widgets|show widgets/i.test(msg)) return 'list-widgets';
    if (/delete widget|remove widget/i.test(msg)) return 'delete-widget';
    if (/habit tracker|open habit/i.test(msg)) return 'open-habit';
    if (/progress|summary/i.test(msg)) return 'show-progress';
    if (/open showroom/i.test(msg)) return 'open-showroom';
    if (/journal|reflect/i.test(msg)) return 'open-journal';
    if (/add quote|motivat/i.test(msg)) return 'add-quote';
    if (/add playlist/i.test(msg)) return 'add-playlist';
    if (/add image/i.test(msg)) return 'add-image';
    return null;
  }

  // Main send handler (add coach mode, encouragement, reflection, breakdown)
  const handleSend = (msg) => {
    if (!msg.trim()) return;
    setMessages((msgs) => [...msgs, { sender: "You", text: msg }]);
    setInput("");
    setShowPrompts(false);
    const action = detectAction(msg);
    if (action === 'coach-mode') {
      setCoachMode(true);
      scheduleCheckin();
      setTimeout(() => setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: `Coach mode activated! I'll check in with you regularly and help you stay accountable. You can say 'stop coach mode' anytime.` }]), 600);
      return;
    }
    if (/stop coach mode|disable coach/i.test(msg)) {
      setCoachMode(false);
      if (checkinTimer.current) clearTimeout(checkinTimer.current);
      checkinTimer.current = null;
      setTimeout(() => setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: `Coach mode deactivated. I'll be here if you need a check-in!` }]), 600);
      return;
    }
    if (action === 'encourage') {
      const goal = lastGoal || (goals && goals[0] && goals[0].text) || 'your goal';
      setTimeout(() => setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: encouragement(goal) }]), 600);
      return;
    }
    if (action === 'reflect') {
      setTimeout(() => setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: `Reflection prompt: ${reflectivePrompt()}` }]), 600);
      return;
    }
    if (action === 'breakdown-milestone') {
      const ms = lastMilestone || 'your milestone';
      setTimeout(() => setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: `Let's break down "${ms}":\n- ${suggestMilestoneBreakdown(ms).join('\n- ')}` }]), 600);
      return;
    }
    if (action === 'help') {
      setShowHelp(true);
      setTimeout(() => setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: `Here are some things I can help with:\n- Create, pin, or unpin goals\n- Add or check off milestones\n- Show your pinned or completed goals\n- Add, list, or delete widgets (quote, image, playlist, habit)\n- Open the Habit Tracker, Goal Showroom, or Journal\n- Show your progress summary\n- Add motivational quotes, playlists, or images as widgets\nJust ask me in natural language!` }]), 600);
      return;
    }
    if (action === 'create-goal') {
      setTimeout(() => {
        setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: "Would you like to create a new goal?", action: 'create-goal' }]);
        setPendingAction({ type: 'create-goal' });
      }, 600);
      return;
    }
    if (action === 'add-milestone') {
      setTimeout(() => {
        setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: "Would you like to add a milestone to an existing goal?", action: 'add-milestone' }]);
        setPendingAction({ type: 'add-milestone' });
      }, 600);
      return;
    }
    if (action === 'pin-goal') {
      setTimeout(() => {
        setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: "Which goal would you like to pin to the showroom?", action: 'pin-goal' }]);
        setPendingAction({ type: 'pin-goal', step: 'ask-goal' });
      }, 600);
      return;
    }
    if (action === 'unpin-goal') {
      setTimeout(() => {
        setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: "Which goal would you like to unpin from the showroom?", action: 'unpin-goal' }]);
        setPendingAction({ type: 'unpin-goal', step: 'ask-goal' });
      }, 600);
      return;
    }
    if (action === 'show-pinned') {
      if (onShowPinned) onShowPinned();
      setTimeout(() => setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: `Here are your pinned goals: ${pinnedGoals.map(g => g.text).join(', ') || 'None yet.'}` }]), 600);
      return;
    }
    if (action === 'show-completed') {
      if (onShowCompleted) onShowCompleted();
      setTimeout(() => setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: `Here are your completed goals: ${completedGoals.map(g => g.text).join(', ') || 'None yet.'}` }]), 600);
      return;
    }
    if (action === 'add-widget') {
      setTimeout(() => {
        setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: "What type of widget? (quote, image, playlist, habit)", action: 'add-widget' }]);
        setPendingAction({ type: 'add-widget', step: 'ask-type' });
      }, 600);
      return;
    }
    if (action === 'list-widgets') {
      const widgets = onListWidgets ? onListWidgets() : [];
      setTimeout(() => setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: `Your widgets: ${widgets.map((w, i) => `${i + 1}. ${w.type}`).join(' | ') || 'None yet.'}` }]), 600);
      return;
    }
    if (action === 'delete-widget') {
      setTimeout(() => {
        setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: "Which widget number would you like to delete?", action: 'delete-widget' }]);
        setPendingAction({ type: 'delete-widget', step: 'ask-idx' });
      }, 600);
      return;
    }
    if (action === 'open-habit') {
      if (onOpenHabitTracker) onOpenHabitTracker();
      setTimeout(() => setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: `Habit Tracker opened!` }]), 600);
      return;
    }
    if (action === 'show-progress') {
      const prog = getProgress ? getProgress() : {};
      setTimeout(() => setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: `Progress: ${prog.totalGoals || 0} total goals, ${prog.completedGoals || 0} completed, ${prog.pinnedGoals || 0} pinned, ${prog.totalMilestones || 0} milestones.` }]), 600);
      return;
    }
    if (action === 'open-showroom') {
      if (onOpenShowroom) onOpenShowroom();
      setTimeout(() => setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: `Goal Showroom opened!` }]), 600);
      return;
    }
    if (action === 'open-journal') {
      if (onOpenJournal) onOpenJournal();
      setTimeout(() => setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: `Journal opened!` }]), 600);
      return;
    }
    if (action === 'add-quote') {
      setTimeout(() => {
        setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: "Type your motivational quote to add as a widget:", action: 'add-quote' }]);
        setPendingAction({ type: 'add-quote', step: 'ask-quote' });
      }, 600);
      return;
    }
    if (action === 'add-playlist') {
      setTimeout(() => {
        setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: "Paste your Spotify playlist link:", action: 'add-playlist' }]);
        setPendingAction({ type: 'add-playlist', step: 'ask-url' });
      }, 600);
      return;
    }
    if (action === 'add-image') {
      setTimeout(() => {
        setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: "Paste your image URL:", action: 'add-image' }]);
        setPendingAction({ type: 'add-image', step: 'ask-url' });
      }, 600);
      return;
    }
    // Default reply
    setTimeout(() => {
      const reply = getPersonaReply(msg);
      let suggestion = '';
      if (/goal|milestone|widget|progress|showroom|journal|habit/i.test(msg)) {
        suggestion = '\n\nYou can also try: "Show my pinned goals", "Add a playlist widget", "Open the habit tracker", "Show my progress summary".';
      }
      setMessages((msgs) => [...msgs, { sender: COUNSELOR_NAME, text: reply + suggestion }]);
    }, 600);
  };

  // Handle action button click (for new features)
  const handleAction = (type) => {
    if (type === 'create-goal') setPendingAction({ type: 'create-goal', step: 'ask-text' });
    if (type === 'add-milestone') setPendingAction({ type: 'add-milestone', step: 'select-goal' });
    if (type === 'add-widget') setPendingAction({ type: 'add-widget', step: 'ask-type' });
    if (type === 'add-quote') setPendingAction({ type: 'add-quote', step: 'ask-quote' });
    if (type === 'add-playlist') setPendingAction({ type: 'add-playlist', step: 'ask-url' });
    if (type === 'add-image') setPendingAction({ type: 'add-image', step: 'ask-url' });
    if (type === 'pin-goal') setPendingAction({ type: 'pin-goal', step: 'ask-goal' });
    if (type === 'unpin-goal') setPendingAction({ type: 'unpin-goal', step: 'ask-goal' });
    if (type === 'delete-widget') setPendingAction({ type: 'delete-widget', step: 'ask-idx' });
  };

  // Handle submit for pending action (expanded)
  const handlePendingSubmit = (e) => {
    e.preventDefault();
    if (!pendingInput.trim()) return;
    if (pendingAction.type === 'create-goal' && pendingAction.step === 'ask-text') {
      if (onCreateGoal) onCreateGoal(pendingInput);
      setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: `Great! Your goal "${pendingInput}" has been created.` }]);
      setPendingAction(null); setPendingInput(""); return;
    }
    if (pendingAction.type === 'add-milestone') {
      if (pendingAction.step === 'select-goal') {
        const goalIdx = goals.findIndex(g => g.text.toLowerCase() === pendingInput.toLowerCase());
        if (goalIdx === -1) {
          setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: `I couldn't find a goal named "${pendingInput}". Please type the exact goal name.` }]);
          return;
        }
        setPendingAction({ type: 'add-milestone', step: 'ask-milestone', goalIdx });
        setPendingInput(""); return;
      } else if (pendingAction.step === 'ask-milestone') {
        if (onAddMilestone) onAddMilestone(pendingAction.goalIdx, pendingInput);
        setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: `Milestone added to your goal!` }]);
        setPendingAction(null); setPendingInput(""); return;
      }
    }
    if (pendingAction.type === 'pin-goal' && pendingAction.step === 'ask-goal') {
      const goalIdx = goals.findIndex(g => g.text.toLowerCase() === pendingInput.toLowerCase());
      if (goalIdx === -1) {
        setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: `I couldn't find a goal named "${pendingInput}". Please type the exact goal name.` }]);
        return;
      }
      if (onPinGoal) onPinGoal(goalIdx);
      setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: `Goal pinned to showroom!` }]);
      setPendingAction(null); setPendingInput(""); return;
    }
    if (pendingAction.type === 'unpin-goal' && pendingAction.step === 'ask-goal') {
      if (onUnpinGoal) onUnpinGoal(pendingInput);
      setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: `Goal unpinned from showroom!` }]);
      setPendingAction(null); setPendingInput(""); return;
    }
    if (pendingAction.type === 'add-widget') {
      if (pendingAction.step === 'ask-type') {
        const type = pendingInput.trim().toLowerCase();
        if (!['quote', 'image', 'playlist', 'habit'].includes(type)) {
          setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: `Widget type must be quote, image, playlist, or habit.` }]);
          return;
        }
        setPendingAction({ type: 'add-widget', step: 'ask-content', widgetType: type });
        setPendingInput(""); return;
      } else if (pendingAction.step === 'ask-content') {
        if (onAddWidget) onAddWidget({ type: pendingAction.widgetType, content: pendingInput, goal: '' });
        setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: `Widget added!` }]);
        setPendingAction(null); setPendingInput(""); return;
      }
    }
    if (pendingAction.type === 'delete-widget' && pendingAction.step === 'ask-idx') {
      const idx = parseInt(pendingInput, 10) - 1;
      if (isNaN(idx) || !onDeleteWidget) {
        setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: `Please enter a valid widget number.` }]);
        return;
      }
      onDeleteWidget(idx);
      setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: `Widget deleted!` }]);
      setPendingAction(null); setPendingInput(""); return;
    }
    if (pendingAction.type === 'add-quote' && pendingAction.step === 'ask-quote') {
      if (onAddQuoteWidget) onAddQuoteWidget(pendingInput);
      setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: `Quote widget added!` }]);
      setPendingAction(null); setPendingInput(""); return;
    }
    if (pendingAction.type === 'add-playlist' && pendingAction.step === 'ask-url') {
      if (onAddPlaylistWidget) onAddPlaylistWidget(pendingInput);
      setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: `Playlist widget added!` }]);
      setPendingAction(null); setPendingInput(""); return;
    }
    if (pendingAction.type === 'add-image' && pendingAction.step === 'ask-url') {
      if (onAddImageWidget) onAddImageWidget(pendingInput);
      setMessages(msgs => [...msgs, { sender: COUNSELOR_NAME, text: `Image widget added!` }]);
      setPendingAction(null); setPendingInput(""); return;
    }
  };

  // Persona-based response helpers
  function personaStyleText(text) {
    if (coachPersona === 'cheerleader') {
      return `🎉 ${text} Let's go! You can do it!`;
    } else if (coachPersona === 'accountability') {
      return `${text} Remember, I'm here to keep you on track. What will you commit to next?`;
    } else if (coachPersona === 'gentle') {
      return `🌱 ${text} Be kind to yourself as you grow.`;
    } else if (coachPersona === 'custom') {
      return `${text} (Custom coach style)`;
    }
    return text;
  }

  // Patch canned replies to use persona
  function getPersonaReply(userMsg) {
    const base = getCounselorReply(userMsg);
    return personaStyleText(base);
  }

  return (
    <div className="virtual-counselor-widget" style={{
      background: '#fffbe8',
      borderRadius: 18,
      boxShadow: '0 8px 32px #ffd1dc55, 0 2px 0 #fffbe8 inset',
      padding: 20,
      maxWidth: 370,
      minWidth: 300,
      margin: '1rem auto',
      border: coachMode ? '3px solid #44bba4' : '2.5px solid #ffd1dc',
      position: 'relative',
      fontFamily: 'Patrick Hand, Comic Sans MS, cursive, sans-serif',
      color: '#4d2600',
      zIndex: 5000,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14, gap: 10 }}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44 }}>
          <CounselorDrawing size={44} />
        </span>
        <div>
          <strong style={{ fontSize: 20 }}>{COUNSELOR_NAME}</strong>
          <span style={{ fontWeight: 400, fontSize: 14, color: coachMode ? '#44bba4' : '#888', marginLeft: 6 }}>{coachMode ? 'Coach Mode' : '(AI Advisor)'}</span>
        </div>
      </div>
      <div className="counselor-chat" style={{
        minHeight: 100,
        maxHeight: 200,
        overflowY: 'auto',
        marginBottom: 12,
        background: '#fff',
        borderRadius: 10,
        padding: 10,
        border: '1.5px solid #e0e0e0',
        fontSize: 16,
        boxShadow: '0 1px 6px #ffd1dc22',
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 8, textAlign: m.sender === 'You' ? 'right' : 'left' }}>
            <span style={{ fontWeight: m.sender === 'You' ? 500 : 700, color: m.sender === 'You' ? '#1976d2' : '#b35c00' }}>{m.sender}:</span>
            <span style={{ marginLeft: 6 }}>{m.text}</span>
            {/* Action buttons for counselor offers */}
            {m.action === 'create-goal' && (
              <button style={{ marginLeft: 10, background: '#ffd54f', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 700, cursor: 'pointer' }} onClick={() => handleAction('create-goal')}>Create a new goal</button>
            )}
            {m.action === 'add-milestone' && (
              <button style={{ marginLeft: 10, background: '#b3e5fc', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 700, cursor: 'pointer' }} onClick={() => handleAction('add-milestone')}>Add milestone</button>
            )}
            {m.action === 'pin-goal' && (
              <button style={{ marginLeft: 10, background: '#ffe082', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 700, cursor: 'pointer' }} onClick={() => handleAction('pin-goal')}>Pin goal</button>
            )}
            {m.action === 'unpin-goal' && (
              <button style={{ marginLeft: 10, background: '#ffd1dc', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 700, cursor: 'pointer' }} onClick={() => handleAction('unpin-goal')}>Unpin goal</button>
            )}
            {m.action === 'show-pinned' && (
              <button style={{ marginLeft: 10, background: '#c8e6c9', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 700, cursor: 'pointer' }} onClick={() => handleAction('show-pinned')}>Show pinned goals</button>
            )}
            {m.action === 'show-completed' && (
              <button style={{ marginLeft: 10, background: '#f8bbd0', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 700, cursor: 'pointer' }} onClick={() => handleAction('show-completed')}>Show completed goals</button>
            )}
            {m.action === 'add-widget' && (
              <button style={{ marginLeft: 10, background: '#ffd1dc', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 700, cursor: 'pointer' }} onClick={() => handleAction('add-widget')}>Add Widget</button>
            )}
            {m.action === 'delete-widget' && (
              <button style={{ marginLeft: 10, background: '#e76f51', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 700, cursor: 'pointer', color: '#fff' }} onClick={() => handleAction('delete-widget')}>Delete Widget</button>
            )}
            {m.action === 'add-quote' && (
              <button style={{ marginLeft: 10, background: '#ffe082', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 700, cursor: 'pointer' }} onClick={() => handleAction('add-quote')}>Add Quote</button>
            )}
            {m.action === 'add-playlist' && (
              <button style={{ marginLeft: 10, background: '#b3e5fc', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 700, cursor: 'pointer' }} onClick={() => handleAction('add-playlist')}>Add Playlist</button>
            )}
            {m.action === 'add-image' && (
              <button style={{ marginLeft: 10, background: '#ffd1dc', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 700, cursor: 'pointer' }} onClick={() => handleAction('add-image')}>Add Image</button>
            )}
          </div>
        ))}
      </div>
      {showHelp && (
        <div style={{ background: '#fffbe8', border: '1.5px solid #ffd1dc', borderRadius: 10, padding: 12, marginBottom: 10, color: '#4d2600', fontSize: 15 }}>
          <strong>Virtual Counselor Help:</strong>
          <ul style={{ margin: '8px 0 0 18px', padding: 0, fontSize: 15 }}>
            <li>"Create a new goal"</li>
            <li>"Add a milestone to my goal"</li>
            <li>"Pin my goal 'X'"</li>
            <li>"Show my pinned goals"</li>
            <li>"Add a playlist widget"</li>
            <li>"Open the habit tracker"</li>
            <li>"Show my progress summary"</li>
            <li>"Add a motivational quote"</li>
            <li>"Delete widget 2"</li>
            <li>...and more!</li>
          </ul>
          <button style={{ marginTop: 8, background: '#ffd1dc', border: 'none', borderRadius: 6, padding: '4px 14px', fontWeight: 700, cursor: 'pointer', color: '#b35c00' }} onClick={() => setShowHelp(false)}>Close Help</button>
        </div>
      )}
      {/* Show prompts if no chat yet */}
      {showPrompts && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>Try asking:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {defaultPrompts.map((p, i) => (
              <button key={i} style={{ fontSize: 13, background: '#e3f2fd', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#1976d2', fontWeight: 600 }} onClick={() => handleSend(p)}>{p}</button>
            ))}
          </div>
        </div>
      )}
      {/* Pending action input UI */}
      {pendingAction && (
        <form onSubmit={handlePendingSubmit} style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          {pendingAction.type === 'create-goal' && pendingAction.step === 'ask-text' && (
            <input
              type="text"
              value={pendingInput}
              onChange={e => setPendingInput(e.target.value)}
              placeholder="Enter your new goal..."
              style={{ flex: 1, borderRadius: 8, border: '1.5px solid #ffd1dc', padding: '8px 10px', fontSize: 16, background: '#fff', color: '#4d2600', outline: 'none', boxShadow: '0 1px 4px #ffd1dc22' }}
              autoFocus
            />
          )}
          {pendingAction.type === 'add-milestone' && pendingAction.step === 'select-goal' && (
            <input
              type="text"
              value={pendingInput}
              onChange={e => setPendingInput(e.target.value)}
              placeholder={goals.length ? `Type goal name (e.g. "${goals[0].text}")` : 'Type goal name'}
              style={{ flex: 1, borderRadius: 8, border: '1.5px solid #ffd1dc', padding: '8px 10px', fontSize: 16, background: '#fff', color: '#4d2600', outline: 'none', boxShadow: '0 1px 4px #ffd1dc22' }}
              autoFocus
            />
          )}
          {pendingAction.type === 'add-milestone' && pendingAction.step === 'ask-milestone' && (
            <input
              type="text"
              value={pendingInput}
              onChange={e => setPendingInput(e.target.value)}
              placeholder="Describe the milestone..."
              style={{ flex: 1, borderRadius: 8, border: '1.5px solid #ffd1dc', padding: '8px 10px', fontSize: 16, background: '#fff', color: '#4d2600', outline: 'none', boxShadow: '0 1px 4px #ffd1dc22' }}
              autoFocus
            />
          )}
          {pendingAction.type === 'pin-goal' && pendingAction.step === 'ask-goal' && (
            <input
              type="text"
              value={pendingInput}
              onChange={e => setPendingInput(e.target.value)}
              placeholder={goals.length ? `Type goal name to pin (e.g. "${goals[0].text}")` : 'Type goal name to pin'}
              style={{ flex: 1, borderRadius: 8, border: '1.5px solid #ffd1dc', padding: '8px 10px', fontSize: 16, background: '#fff', color: '#4d2600', outline: 'none', boxShadow: '0 1px 4px #ffd1dc22' }}
              autoFocus
            />
          )}
          {pendingAction.type === 'unpin-goal' && pendingAction.step === 'ask-goal' && (
            <input
              type="text"
              value={pendingInput}
              onChange={e => setPendingInput(e.target.value)}
              placeholder={pinnedGoals.length ? `Type goal name to unpin (e.g. "${pinnedGoals[0].text}")` : 'Type goal name to unpin'}
              style={{ flex: 1, borderRadius: 8, border: '1.5px solid #ffd1dc', padding: '8px 10px', fontSize: 16, background: '#fff', color: '#4d2600', outline: 'none', boxShadow: '0 1px 4px #ffd1dc22' }}
              autoFocus
            />
          )}
          {pendingAction.type === 'add-widget' && pendingAction.step === 'ask-type' && (
            <input
              type="text"
              value={pendingInput}
              onChange={e => setPendingInput(e.target.value)}
              placeholder="Enter widget type (quote, image, playlist, habit)"
              style={{ flex: 1, borderRadius: 8, border: '1.5px solid #ffd1dc', padding: '8px 10px', fontSize: 16, background: '#fff', color: '#4d2600', outline: 'none', boxShadow: '0 1px 4px #ffd1dc22' }}
              autoFocus
            />
          )}
          {pendingAction.type === 'add-widget' && pendingAction.step === 'ask-content' && (
            <input
              type="text"
              value={pendingInput}
              onChange={e => setPendingInput(e.target.value)}
              placeholder="Enter widget content (e.g. quote text, image URL)"
              style={{ flex: 1, borderRadius: 8, border: '1.5px solid #ffd1dc', padding: '8px 10px', fontSize: 16, background: '#fff', color: '#4d2600', outline: 'none', boxShadow: '0 1px 4px #ffd1dc22' }}
              autoFocus
            />
          )}
          {pendingAction.type === 'delete-widget' && pendingAction.step === 'ask-idx' && (
            <input
              type="text"
              value={pendingInput}
              onChange={e => setPendingInput(e.target.value)}
              placeholder="Enter widget number to delete"
              style={{ flex: 1, borderRadius: 8, border: '1.5px solid #ffd1dc', padding: '8px 10px', fontSize: 16, background: '#fff', color: '#4d2600', outline: 'none', boxShadow: '0 1px 4px #ffd1dc22' }}
              autoFocus
            />
          )}
          {pendingAction.type === 'add-quote' && pendingAction.step === 'ask-quote' && (
            <input
              type="text"
              value={pendingInput}
              onChange={e => setPendingInput(e.target.value)}
              placeholder="Enter your motivational quote"
              style={{ flex: 1, borderRadius: 8, border: '1.5px solid #ffd1dc', padding: '8px 10px', fontSize: 16, background: '#fff', color: '#4d2600', outline: 'none', boxShadow: '0 1px 4px #ffd1dc22' }}
              autoFocus
            />
          )}
          {pendingAction.type === 'add-playlist' && pendingAction.step === 'ask-url' && (
            <input
              type="text"
              value={pendingInput}
              onChange={e => setPendingInput(e.target.value)}
              placeholder="Paste your Spotify playlist link"
              style={{ flex: 1, borderRadius: 8, border: '1.5px solid #ffd1dc', padding: '8px 10px', fontSize: 16, background: '#fff', color: '#4d2600', outline: 'none', boxShadow: '0 1px 4px #ffd1dc22' }}
              autoFocus
            />
          )}
          {pendingAction.type === 'add-image' && pendingAction.step === 'ask-url' && (
            <input
              type="text"
              value={pendingInput}
              onChange={e => setPendingInput(e.target.value)}
              placeholder="Paste your image URL"
              style={{ flex: 1, borderRadius: 8, border: '1.5px solid #ffd1dc', padding: '8px 10px', fontSize: 16, background: '#fff', color: '#4d2600', outline: 'none', boxShadow: '0 1px 4px #ffd1dc22' }}
              autoFocus
            />
          )}
          <button type="submit" style={{ background: '#ffd54f', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, color: '#6d4c41', fontSize: 16, cursor: 'pointer', boxShadow: '0 1px 4px #ffd1dc33', transition: 'background 0.2s' }}>Submit</button>
        </form>
      )}
      {/* Only show main input if not in pending action */}
      {!pendingAction && (
        <form onSubmit={e => { e.preventDefault(); handleSend(input); }} style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask for advice..."
            style={{
              flex: 1,
              borderRadius: 8,
              border: '1.5px solid #ffd1dc',
              padding: '8px 10px',
              fontSize: 16,
              background: '#fff',
              color: '#4d2600',
              outline: 'none',
              boxShadow: '0 1px 4px #ffd1dc22',
            }}
          />
          <button type="submit" style={{
            background: '#ffd54f',
            border: 'none',
            borderRadius: 8,
            padding: '8px 18px',
            fontWeight: 700,
            color: '#6d4c41',
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 1px 4px #ffd1dc33',
            transition: 'background 0.2s',
          }}>Send</button>
        </form>
      )}
    </div>
  );
};

export default VirtualCounselor;
