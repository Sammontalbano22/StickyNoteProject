import { useState } from 'react';

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
  "Start by making your goal specific and measurable. What exactly do you want to achieve?",
  "If you feel stuck, try breaking your goal into smaller, manageable steps and celebrate small wins.",
  "Motivation can come and go. Build habits and routines that support your goal, and remind yourself why it matters.",
  "Procrastination is normal! Try setting a timer for 10 minutes and just start. Action creates momentum."
];

function getCounselorReply(userMsg) {
  // In a real app, call an AI API here. For now, use canned responses.
  if (/procrastinat/i.test(userMsg)) return exampleReplies[3];
  if (/motivat/i.test(userMsg)) return exampleReplies[2];
  if (/stuck|blocked|can't/i.test(userMsg)) return exampleReplies[1];
  if (/break|step|milestone/i.test(userMsg)) return exampleReplies[1];
  if (/goal|set/i.test(userMsg)) return exampleReplies[0];
  return "That's a great question! Can you tell me more about your goal or what's challenging you?";
}

const VirtualCounselor = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [showPrompts, setShowPrompts] = useState(true);

  const handleSend = (msg) => {
    if (!msg.trim()) return;
    setMessages((msgs) => [...msgs, { sender: "You", text: msg }]);
    setInput("");
    setTimeout(() => {
      const reply = getCounselorReply(msg);
      setMessages((msgs) => [...msgs, { sender: COUNSELOR_NAME, text: reply }]);
    }, 600);
    setShowPrompts(false);
  };

  return (
    <div className="virtual-counselor-widget" style={{ background: '#f3f7fa', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 16, maxWidth: 340, margin: '1rem auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 28, marginRight: 8 }}>{COUNSELOR_AVATAR}</span>
        <strong>{COUNSELOR_NAME} <span style={{ fontWeight: 400, fontSize: 14, color: '#888' }}>(AI Advisor)</span></strong>
      </div>
      <div className="counselor-chat" style={{ minHeight: 80, maxHeight: 180, overflowY: 'auto', marginBottom: 8, background: '#fff', borderRadius: 8, padding: 8, border: '1px solid #e0e0e0' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 6, textAlign: m.sender === 'You' ? 'right' : 'left' }}>
            <span style={{ fontWeight: m.sender === 'You' ? 500 : 600, color: m.sender === 'You' ? '#1976d2' : '#6d4c41' }}>{m.sender}:</span>
            <span style={{ marginLeft: 6 }}>{m.text}</span>
          </div>
        ))}
      </div>
      {showPrompts && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>Try asking:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {defaultPrompts.map((p, i) => (
              <button key={i} style={{ fontSize: 13, background: '#e3f2fd', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }} onClick={() => handleSend(p)}>{p}</button>
            ))}
          </div>
        </div>
      )}
      <form onSubmit={e => { e.preventDefault(); handleSend(input); }} style={{ display: 'flex', gap: 6 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask for advice..."
          style={{ flex: 1, borderRadius: 6, border: '1px solid #ccc', padding: '6px 8px' }}
        />
        <button type="submit" style={{ background: '#ffd54f', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 600, color: '#6d4c41', cursor: 'pointer' }}>Send</button>
      </form>
    </div>
  );
};

export default VirtualCounselor;
