// src/components/Auth.jsx

import React, { useState, useEffect, useRef } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const aboutText = `
A huge thank-you to my project partner, Jake Holcombe, whose creativity has helped make this project a success!

About the Project
The Sticky Note That Changed My Life! Growing up, I always knew I wanted to go to college. I was captivated by the idea of learning from world-class resources and being part of a community that was dedicated to growth. But I also knew the path wouldn’t be easy—college is expensive, and navigating the road to higher education takes more than just ambition.

At the start of my freshman year of high school, I made two long-term goals:

To have options when choosing a university

To attend college on a full-ride scholarship

These were bold dreams. Less than 1% of students earn a full-ride scholarship, and I was well aware of the odds. But that awareness didn’t discourage me—it pushed me. For the first time in my life, I wrote a goal down. On a small 3x3 sticky note, I wrote: “I will be a Daniels Fund Scholar.” The Daniels Fund is a prestigious full-ride scholarship program in the Southwestern United States, and I stuck that note right next to my bed.

That sticky note became my compass. On days when I felt motivated, I’d look at it and feel a surge of purpose. And on days when I felt like doing nothing at all, I’d still see it. It reminded me that taking even one small step toward my goal was still progress. It taught me that showing up, consistently, is its own kind of victory.

My junior year of high school tested that belief. I suffered a traumatic injury that forced me to miss a significant amount of school. When I returned, I felt like a shadow of my former self. But the sticky note was still there. It reminded me why I needed to keep going. Even if all I could do was show up to class, that was still a step.

After four years of steady, intentional effort—bit by bit, day by day—I received the life-changing news: I had been selected as a Daniels Fund Scholar. I had earned a full-ride scholarship to study at a university of my choice. That moment will remain one of the most vivid memories of my life. I walked over to the sticky note and, with pride and overwhelming gratitude, crossed it off. That little square of paper became a symbol of resilience, discipline, and unwavering self-belief.

Anyone who has ever set a New Year’s resolution only to give up weeks later knows the truth: long-term goals are hard. In a world of instant gratification, it's difficult to keep striving when the results aren’t immediate. Long-term success demands consistency, habits, and faith in the process.

That’s why, for my senior design project—an independent study through the Computer Science department at the University of Denver—I’m developing an app inspired by this experience. The app will help users set and stay accountable to their long-term goals, using motivation techniques like habit tracking, reflective prompts, milestone celebrations, and even a virtual progress counselor. My hope is to make long-term goals feel achievable by breaking them down into small day by day goals.
`;

const tipsAndQuotes = [
  // Motivational quotes
  "Success is the sum of small efforts, repeated day in and day out. – Robert Collier",
  "You don’t have to be perfect, just consistent.",
  "A journey of a thousand miles begins with a single step. – Lao Tzu",
  "Discipline is choosing between what you want now and what you want most.",
  "Small daily improvements are the key to staggering long-term results. – James Clear",
  // Tips
  "Tip: Break your big goal into tiny, actionable steps you can do today.",
  "Tip: Write your goal somewhere you’ll see it every day.",
  "Tip: Celebrate small wins—they add up!",
  "Tip: If you miss a day, just start again. Progress isn’t linear.",
  "Tip: Share your goal with a friend for extra accountability."
];

const Auth = () => {
  const [showAbout, setShowAbout] = useState(false);
  const [tipIdx, setTipIdx] = useState(() => {
    const idx = localStorage.getItem('loginTipIdx');
    return idx ? Number(idx) : Math.floor(Math.random() * tipsAndQuotes.length);
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stickyState, setStickyState] = useState('corner');
  const [showStickyMsg, setShowStickyMsg] = useState(false);
  const emailRef = useRef();
  const stickyRef = useRef();
  const typingTimer = useRef();
  const exampleEmail = 'you@domain.com';

  // Use window.auth from firebase-init.js
  const auth = window.auth;

  // --- Auto-type animation for email input ---
  useEffect(() => {
    if (email) return; // Don't auto-type if user already typed
    let idx = 0;
    function typeNext() {
      if (idx < exampleEmail.length) {
        setEmail(exampleEmail.slice(0, idx + 1));
        idx++;
        typingTimer.current = setTimeout(typeNext, 70);
      }
    }
    typingTimer.current = setTimeout(typeNext, 400);
    return () => clearTimeout(typingTimer.current);
  }, []); // Only on mount

  // Cancel auto-type on focus or user input
  const handleEmailFocus = () => {
    clearTimeout(typingTimer.current);
    // If the field contains the template, clear it for user typing
    if (email === exampleEmail) {
      setEmail('');
    }
  };
  const handleEmailChange = (e) => {
    clearTimeout(typingTimer.current);
    setEmail(e.target.value);
  };

  // Animation on successful login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      window.currentUser = userCred.user;
      // Animate sticky note to center
      setStickyState('center');
      setTimeout(() => {
        setShowStickyMsg(true);
        setTimeout(() => {
          setStickyState('done');
          // Optionally, trigger dashboard entry here (e.g. via props.onLoginSuccess())
          // For now, just let parent App handle auth state
        }, 1200);
      }, 700);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      window.currentUser = userCred.user;
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleNextTip = () => {
    const nextIdx = (tipIdx + 1) % tipsAndQuotes.length;
    setTipIdx(nextIdx);
    localStorage.setItem('loginTipIdx', nextIdx);
  };

  // --- Render ---
  return (
    <div id="auth-section">
      {/* ...existing code... */}
      <div className="login-container" style={{
        position: 'relative',
        minHeight: 320,
        background: '#fffbe7',
        borderRadius: 18,
        boxShadow: '0 2px 16px 0 #ffe06655',
        padding: '2.2rem 1.5rem 1.5rem 1.5rem',
        maxWidth: 370,
        margin: '2.5rem auto 0 auto',
        fontFamily: 'Patrick Hand, cursive',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 1,
      }}>
        {/* Sticky note animation overlay (unchanged) */}
        {stickyState !== 'done' && (
          <div
            id="sticky-note-anim"
            style={{
              width: 180,
              height: 180,
              background: '#fffb7d',
              borderRadius: 18,
              boxShadow: '0 2px 16px 0 #ffe06655',
              position: 'absolute',
              right: stickyState === 'corner' ? 0 : '50%',
              top: stickyState === 'corner' ? 0 : '50%',
              transform: stickyState === 'corner' ? 'translate(40%,-40%) scale(0.7)' : 'translate(50%,-50%) scale(1.1)',
              transition: 'all 0.7s cubic-bezier(.4,2,.6,1.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Patrick Hand, cursive',
              fontSize: '1.2rem',
              color: '#b8860b',
              zIndex: 2000,
              pointerEvents: 'none',
              border: '2.5px solid #ffe066',
              boxSizing: 'border-box',
              filter: 'drop-shadow(0 2px 16px #ffe06677)',
            }}
          >
            {showStickyMsg ? (
              <span style={{ fontSize: '1.3rem', fontWeight: 600, textAlign: 'center', width: '90%' }}>I achieve my goals!</span>
            ) : null}
          </div>
        )}
        {/* Login form and content, only hide when stickyState is 'done' */}
        {stickyState !== 'done' && (
          <form
            id="login-form"
            style={{
              width: '100%',
              maxWidth: 320,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.1rem',
              background: 'rgba(255,251,231,0.97)',
              borderRadius: 14,
              boxShadow: '0 1.5px 8px 0 #ffe06633',
              padding: '1.2rem 1.1rem 1.1rem 1.1rem',
              fontFamily: 'Patrick Hand, cursive',
              zIndex: 2,
            }}
            onSubmit={e => { e.preventDefault(); handleLogin(e); }}
          >
            <input
              type="email"
              id="email"
              ref={emailRef}
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
              autoComplete="username"
              required
              onFocus={handleEmailFocus}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: 10,
                border: '1.5px solid #ffe066',
                background: '#fffde4',
                fontFamily: 'Patrick Hand, cursive',
                fontSize: '1.13rem',
                color: '#b8860b',
                boxShadow: '0 1px 4px 0 #ffe06622',
                outline: 'none',
                transition: 'border 0.2s',
              }}
              onBlur={e => e.target.style.border = '1.5px solid #ffe066'}
            />
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: 10,
                border: '1.5px solid #ffe066',
                background: '#fffde4',
                fontFamily: 'Patrick Hand, cursive',
                fontSize: '1.13rem',
                color: '#b8860b',
                boxShadow: '0 1px 4px 0 #ffe06622',
                outline: 'none',
                transition: 'border 0.2s',
              }}
              onFocus={e => e.target.style.border = '2.5px solid #ffd700'}
              onBlur={e => e.target.style.border = '1.5px solid #ffe066'}
            />
            <button
              onClick={handleLogin}
              disabled={loading}
              type="submit"
              style={{
                background: 'linear-gradient(90deg,#ffe066 0%,#ffd700 100%)',
                color: '#3a2a00',
                fontWeight: 600,
                padding: '0.85rem',
                borderRadius: 10,
                border: 'none',
                fontFamily: 'Patrick Hand, cursive',
                fontSize: '1.13rem',
                boxShadow: '0 1.5px 8px 0 #ffe06633',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s, box-shadow 0.2s',
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <button
              onClick={handleSignup}
              disabled={loading}
              type="button"
              style={{
                background: 'linear-gradient(90deg,#ffd700 0%,#ffe066 100%)',
                color: '#3a2a00',
                fontWeight: 600,
                padding: '0.85rem',
                borderRadius: 10,
                border: 'none',
                fontFamily: 'Patrick Hand, cursive',
                fontSize: '1.13rem',
                boxShadow: '0 1.5px 8px 0 #ffe06633',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s, box-shadow 0.2s',
              }}
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
            {error && (
              <div style={{
                color: '#d7263d',
                background: '#fff3cd',
                border: '1.5px solid #ffe066',
                borderRadius: 8,
                padding: '0.6em 0.9em',
                fontSize: '1.01rem',
                fontFamily: 'Patrick Hand, cursive',
                marginTop: '-0.5em',
                boxShadow: '0 1px 4px 0 #ffe06622',
              }}>{error}</div>
            )}
          </form>
        )}
        {/* Motivational tip/quote box */}
        {stickyState !== 'done' && (
          <div className="login-tip-box" style={{
            marginTop: '1.2rem',
            background: '#fffde4',
            borderRadius: 12,
            boxShadow: '0 1px 6px 0 #ffe06633',
            padding: '0.8rem 1.1rem',
            fontFamily: 'Patrick Hand, cursive',
            color: '#b8860b',
            fontSize: '1.08rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.7em',
            maxWidth: 320,
            width: '100%',
            zIndex: 1,
          }}>
            <span role="img" aria-label="lightbulb">💡</span> {tipsAndQuotes[tipIdx]}
            <button
              type="button"
              className="next-tip-btn"
              title="Show another tip or quote"
              onClick={handleNextTip}
              style={{
                marginLeft: '0.5em',
                fontSize: '0.98em',
                background: 'none',
                border: 'none',
                color: '#b8860b',
                cursor: 'pointer',
                borderRadius: 6,
                padding: '0.2em 0.5em',
                transition: 'background 0.2s',
              }}
              onMouseOver={e => e.target.style.background = '#ffe06644'}
              onMouseOut={e => e.target.style.background = 'none'}
            >
              ↻
            </button>
          </div>
        )}
      </div>
      {/* ...existing code... */}
    </div>
  );
};

export default Auth;
