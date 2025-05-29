import React, { useState, useRef, useEffect } from 'react';
import { auth } from '../js/firebase-init.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import './Auth.css';

// --- Constants ---
const APP_DESCRIPTION = `The Sticky Note That Changed My Life! Growing up, I always knew I wanted to go to college. I was captivated by the idea of learning from world-class resources and being part of a community that was dedicated to growth. But I also knew the path wouldn’t be easy—college is expensive, and navigating the road to higher education takes more than just ambition.\n\nAt the start of my freshman year of high school, I made two long-term goals:\n\nTo have options when choosing a university\n\nTo attend college on a full-ride scholarship\n\nThese were bold dreams. Less than 1% of students earn a full-ride scholarship, and I was well aware of the odds. But that awareness didn’t discourage me—it pushed me. For the first time in my life, I wrote a goal down. On a small 3x3 sticky note, I wrote: “I will be a Daniels Fund Scholar.” The Daniels Fund is a prestigious full-ride scholarship program in the Southwestern United States, and I stuck that note right next to my bed.\n\nThat sticky note became my compass. On days when I felt motivated, I’d look at it and feel a surge of purpose. And on days when I felt like doing nothing at all, I’d still see it. It reminded me that taking even one small step toward my goal was still progress. It taught me that showing up, consistently, is its own kind of victory.\n\nMy junior year of high school tested that belief. I suffered a traumatic injury that forced me to miss a significant amount of school. When I returned, I felt like a shadow of my former self. But the sticky note was still there. It reminded me why I needed to keep going. Even if all I could do was show up to class, that was still a step.\n\nAfter four years of steady, intentional effort—bit by bit, day by day—I received the life-changing news: I had been selected as a Daniels Fund Scholar. I had earned a full-ride scholarship to study at a university of my choice. That moment will remain one of the most vivid memories of my life. I walked over to the sticky note and, with pride and overwhelming gratitude, crossed it off. That little square of paper became a symbol of resilience, discipline, and unwavering self-belief.\n\nAnyone who has ever set a New Year’s resolution only to give up weeks later knows the truth: long-term goals are hard. In a world of instant gratification, it's difficult to keep striving when the results aren’t immediate. Long-term success demands consistency, habits, and faith in the process.\n\nThat’s why, for my senior design project—an independent study through the Computer Science department at the University of Denver—I’m developing an app inspired by this experience. The app will help users set and stay accountable to their long-term goals, using motivation techniques like habit tracking, reflective prompts, milestone celebrations, and even a virtual progress counselor. My hope is to make long-term goals feel achievable by breaking them down into small day by day goals.`;

const GOAL_TIPS = [
  "Set goals that excite you and scare you at the same time.",
  "A goal without a plan is just a wish.",
  "Long-term goals require short-term wins. Celebrate progress!",
  "Break big dreams into small, actionable steps.",
  "Consistency beats intensity for long-term success.",
  "Visualize your future self achieving your goal.",
  "Review your goals regularly and adjust as needed.",
  "Stay patient. Big things take time.",
  "Your goals are the road maps that guide you and show you what is possible for your life. – Les Brown",
  "Don’t watch the clock; do what it does. Keep going. – Sam Levenson"
];

// --- Utility Functions ---
function spiralArc(cx, cy, r1, r2, a1, a2) {
  // Returns SVG path for an arc from angle a1 to a2, radius r1 to r2
  const p1x = cx + r1 * Math.cos(a1);
  const p1y = cy + r1 * Math.sin(a1);
  const p2x = cx + r2 * Math.cos(a2);
  const p2y = cy + r2 * Math.sin(a2);
  const largeArc = a2 - a1 > Math.PI ? 1 : 0;
  return `M${p1x},${p1y} A${(r1+r2)/2},${(r1+r2)/2} 0 ${largeArc} 1 ${p2x},${p2y}`;
}

// --- Main Auth Component ---
const Auth = ({ onLoginSuccess }) => {
  // --- State ---
  const [showDescription, setShowDescription] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSpider, setShowSpider] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [spiderSwing, setSpiderSwing] = useState({ left: 0, top: 0 });
  const [randomTip, setRandomTip] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [spiderPhase, setSpiderPhase] = useState(0); // 0: descend, 1: web, 2: text, 3: done
  const [spiderPos, setSpiderPos] = useState({ x: 60, y: 60 }); // SVG coords
  const [webReveal, setWebReveal] = useState(0); // 0-1, percent of web drawn
  const [textReveal, setTextReveal] = useState(0); // 0-1, percent of text drawn
  const spiderTimeout = useRef(null);
  const signupBtnRef = useRef(null);

  // --- Constants for Spider Web ---
  const RADIALS = 32;
  const RINGS = 5;
  const webCenter = { x: 60, y: 60 };
  const webRadius = 55;
  const webCircle = Array.from({length: RADIALS}, (_,i) => {
    const angle = (Math.PI * 2 * i) / RADIALS;
    return {
      x: webCenter.x + webRadius * Math.cos(angle - Math.PI/2),
      y: webCenter.y + webRadius * Math.sin(angle - Math.PI/2)
    };
  });
  const textPath = [
    {x:60, y:165}, {x:65, y:170}, {x:70, y:175}, {x:75, y:170}, {x:80, y:165},
    {x:85, y:170}, {x:90, y:175}, {x:95, y:170}, {x:100, y:165},
  ];

  // --- Effects ---
  // Spider easter egg
  useEffect(() => {
    if (email.trim().toLowerCase() === 'spider') {
      setShowSpider(true);
      clearTimeout(spiderTimeout.current);
      spiderTimeout.current = setTimeout(() => setShowSpider(false), 5000);
    } else {
      setShowSpider(false);
      clearTimeout(spiderTimeout.current);
    }
    return () => clearTimeout(spiderTimeout.current);
  }, [email]);

  // Update spider position
  useEffect(() => {
    if (showSpider && signupBtnRef.current) {
      const btnRect = signupBtnRef.current.getBoundingClientRect();
      setSpiderSwing({
        left: btnRect.left + btnRect.width / 2 - 30,
        top: btnRect.bottom,
      });
    }
  }, [showSpider]);
  useEffect(() => {
    if (!showSpider) return;
    const handleResize = () => {
      if (signupBtnRef.current) {
        const btnRect = signupBtnRef.current.getBoundingClientRect();
        setSpiderSwing({
          left: btnRect.left + btnRect.width / 2 - 30,
          top: btnRect.bottom,
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showSpider]);

  // Reset spider animation
  useEffect(() => {
    if (showSpider) {
      setSpiderPhase(0);
      setSpiderPos({ x: 60, y: 60 });
      setWebReveal(0);
      setTextReveal(0);
    }
  }, [showSpider]);

  // Spider animation sequence
  useEffect(() => {
    if (!showSpider) return;
    let raf;
    let start;
    function animate(ts) {
      if (!start) start = ts;
      const t = (ts - start) / 1000;
      if (spiderPhase === 0) {
        setSpiderPos({ x: 60, y: 60 + Math.min(50, t * 80) });
        if (t > 0.7) { setSpiderPhase(1); start = ts; }
      } else if (spiderPhase === 1) {
        const reveal = Math.min(1, t / 2.2);
        setWebReveal(reveal);
        const idx = Math.floor(reveal * (webCircle.length-1));
        setSpiderPos(webCircle[idx]);
        if (reveal >= 1) { setWebReveal(1); setSpiderPhase(2); start = ts; }
      } else if (spiderPhase === 2) {
        const reveal = Math.min(1, t / 1.2);
        setTextReveal(reveal);
        const idx = Math.floor(reveal * (textPath.length-1));
        setSpiderPos(textPath[idx] || textPath[textPath.length-1]);
        if (reveal >= 1) { setTextReveal(1); setSpiderPhase(3); }
      }
      if (spiderPhase < 3) raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);
    return () => raf && cancelAnimationFrame(raf);
  }, [showSpider, spiderPhase]);

  // Set random tip on mount
  useEffect(() => {
    setRandomTip(GOAL_TIPS[Math.floor(Math.random() * GOAL_TIPS.length)]);
  }, []);

  // --- Handlers ---
  const handleSignup = async e => {
    e.preventDefault();
    if (!email || !password) {
      setStatusMsg('Please enter your email and password.');
      return;
    }
    if (password.length < 6) {
      setStatusMsg('❌ Password must be at least 6 characters');
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setStatusMsg('✅ Signed up');
      setEmail('');
      setPassword('');
    } catch (err) {
      setStatusMsg('❌ ' + (err.message || 'Sign up failed'));
    }
  };

  const handleLogin = async e => {
    e.preventDefault();
    if (!email || !password) {
      setStatusMsg('Please enter your email and password.');
      return;
    }
    try {
      const { setPersistence, browserSessionPersistence } = await import('firebase/auth');
      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      setStatusMsg('✅ Logged in');
      setEmail('');
      setPassword('');
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setStatusMsg('❌ ' + (err.message || 'Log in failed'));
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setStatusMsg('Enter your email above to reset password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setStatusMsg('📧 Password reset email sent!');
    } catch (err) {
      setStatusMsg('❌ ' + (err.message || 'Could not send reset email'));
    }
  };

  // --- Render ---
  return (
    <>
      {/* Sharp, square sticky note background decorations - larger and more spread out */}
      <div className="sticky-bg-note sticky-bg-yellow" style={{ width: 140, height: 140, left: 24, top: 32, transform: 'rotate(-7deg)' }} />
      <div className="sticky-bg-note sticky-bg-pink" style={{ width: 120, height: 120, right: 40, top: 60, transform: 'rotate(10deg)' }} />
      <div className="sticky-bg-note sticky-bg-blue" style={{ width: 130, height: 130, left: 80, bottom: 80, transform: 'rotate(-13deg)' }} />
      <div className="sticky-bg-note sticky-bg-green" style={{ width: 110, height: 110, right: 120, bottom: 160, transform: 'rotate(6deg)' }} />
      <div className="sticky-bg-note sticky-bg-purple" style={{ width: 125, height: 125, left: '55%', top: 40, transform: 'translateX(-50%) rotate(4deg)' }} />
      <div className="sticky-bg-note sticky-bg-yellow" style={{ width: 110, height: 110, left: 300, top: 320, transform: 'rotate(-3deg)' }} />
      <div className="sticky-bg-note sticky-bg-pink" style={{ width: 100, height: 100, right: 260, top: 420, transform: 'rotate(8deg)' }} />
      <div className="sticky-bg-note sticky-bg-blue" style={{ width: 120, height: 120, left: 60, bottom: 260, transform: 'rotate(-10deg)' }} />
      <div className="sticky-bg-note sticky-bg-green" style={{ width: 100, height: 100, right: 60, bottom: 60, transform: 'rotate(2deg)' }} />
      <div className="sticky-bg-note sticky-bg-purple" style={{ width: 120, height: 120, left: '70%', top: 220, transform: 'translateX(-50%) rotate(-5deg)' }} />
      <div className="sticky-bg-note sticky-bg-yellow" style={{ width: 130, height: 130, left: 0, bottom: 0, transform: 'rotate(-8deg)' }} />
      <div className="sticky-bg-note sticky-bg-pink" style={{ width: 110, height: 110, right: 0, bottom: 0, transform: 'rotate(12deg)' }} />
      <h1
        className="sticky-title sticky-title-large sticky-title-interactive auth-title"
        tabIndex={0}
        onClick={() => setShowDescription((v) => !v)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowDescription(v => !v); }}
        aria-expanded={showDescription}
        aria-controls="app-description"
        title="Click to learn more about this app"
      >
        <span className={showDescription ? 'auth-title-span open' : 'auth-title-span'}>
          The Sticky Note Project
        </span>
        <span
          aria-hidden="true"
          className={showDescription ? 'auth-title-arrow open' : 'auth-title-arrow'}
        >
          {showDescription ? '▲' : '▼'}
        </span>
      </h1>
      {/* Attractive, non-intrusive UI prompt to click the title */}
      {!showDescription && (
        <div className="auth-tip-prompt" tabIndex={0}
          onClick={() => setShowDescription(true)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowDescription(true); }}
          aria-label="Click to learn more about this app"
        >
          <span className="auth-tip-icon">💡</span>
          <span className="auth-tip-text">Tip: <b>Click the Sticky Note Project title</b> to learn the story!</span>
          <span className="auth-tip-hand">👆</span>
        </div>
      )}
      {/* Spider and web attached to Sign Up button only */}
      {showSpider && (
        <div className="spider-anim" style={{ left: spiderSwing.left, top: spiderSwing.top }}>
          <svg width="120" height="220" className="spider-svg">
            {/* Web string from button to spider */}
            <line x1="60" y1="0" x2={spiderPos.x} y2={spiderPos.y} stroke="#888" strokeDasharray="4 4" strokeWidth="2" />
            {/* Improved full circular web, revealed progressively */}
            <g stroke="#bbb" strokeWidth="1.1" fill="none">
              {/* Radial lines */}
              {webCircle.map((pt,i) => (
                <line key={i} x1={webCenter.x} y1={webCenter.y} x2={pt.x} y2={pt.y} style={{ opacity: i/RADIALS < webReveal ? 1 : 0 }} />
              ))}
              {/* Concentric rings */}
              {Array.from({length: RINGS}, (_,ri) => {
                const r = webRadius * (1 - ri/(RINGS+1));
                return (
                  <circle key={ri} cx={webCenter.x} cy={webCenter.y} r={r} strokeDasharray={Math.PI*2*r} strokeDashoffset={(1-webReveal)*Math.PI*2*r} />
                );
              })}
              {/* Spiral arcs for realism */}
              {Array.from({length: RINGS-1}, (_,ri) => {
                const r1 = webRadius * (1 - ri/(RINGS+1));
                const r2 = webRadius * (1 - (ri+1)/(RINGS+1));
                return Array.from({length: RADIALS}, (_,i) => {
                  const a1 = (Math.PI * 2 * i) / RADIALS;
                  const a2 = a1 + Math.PI*2/(RADIALS*2);
                  return (
                    <path key={ri+'-'+i} d={spiralArc(webCenter.x, webCenter.y, r1, r2, a1-Math.PI/2, a2-Math.PI/2)} stroke="#ccc" strokeWidth="0.7" style={{ opacity: webReveal }} />
                  );
                });
              })}
            </g>
            {/* Text: Great Job! - revealed letter by letter, spider moves along text path */}
            <g>
              <text x="60" y="180" textAnchor="middle" fontFamily="'Patrick Hand', 'Comic Sans MS', cursive, sans-serif" fontSize="22" fill="#b8860b" stroke="#fff" strokeWidth="0.8" className="spider-text">
                {Array.from('Great Job!').map((ch, i) => i < Math.ceil(textReveal * 10) ? ch : ' ').join('')}
              </text>
            </g>
            {/* Spider body at current position */}
            <g transform={`translate(${spiderPos.x - 30},${spiderPos.y - 10})`}>
              <ellipse cx="30" cy="30" rx="16" ry="18" fill="#222" />
              <ellipse cx="30" cy="18" rx="10" ry="10" fill="#333" />
              {/* Eyes */}
              <circle cx="26" cy="16" r="2.5" fill="#fff" />
              <circle cx="34" cy="16" r="2.5" fill="#fff" />
              <circle cx="26" cy="16" r="1.2" fill="#222" />
              <circle cx="34" cy="16" r="1.2" fill="#222" />
              {/* Legs */}
              <path d="M10,30 Q0,20 10,10" stroke="#222" strokeWidth="2" fill="none" />
              <path d="M50,30 Q60,20 50,10" stroke="#222" strokeWidth="2" fill="none" />
              <path d="M12,40 Q2,50 18,55" stroke="#222" strokeWidth="2" fill="none" />
              <path d="M48,40 Q58,50 42,55" stroke="#222" strokeWidth="2" fill="none" />
              <path d="M16,50 Q8,60 24,58" stroke="#222" strokeWidth="2" fill="none" />
              <path d="M44,50 Q52,60 36,58" stroke="#222" strokeWidth="2" fill="none" />
            </g>
          </svg>
        </div>
      )}
      <div
        id="app-description"
        className={showDescription ? 'app-description open' : 'app-description'}
        aria-hidden={!showDescription}
      >
        {APP_DESCRIPTION}
      </div>
      {/* Login box wrapper for perfect centering */}
      <div className="login-box" role="form" aria-labelledby="login-form-title">
        <input
          id="email"
          type="email"
          className="auth-input"
          placeholder="Email"
          autoComplete="username"
          aria-label="Email address"
          aria-required="true"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <div className="auth-password-wrapper">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            className="auth-input"
            placeholder="Password"
            autoComplete="current-password"
            aria-label="Password"
            aria-required="true"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={0}
            className="auth-password-toggle"
            onClick={() => setShowPassword(v => !v)}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        <div className="auth-forgot-row">
          <button
            type="button"
            aria-label="Forgot password? Send password reset email"
            tabIndex={0}
            className="auth-forgot-btn"
            onClick={handlePasswordReset}
          >
            Forgot password?
          </button>
        </div>
        {/* Button row wrapper for perfect centering */}
        <div className="auth-btn-row">
          {showSpider && (
            <div className="spider-anim" style={{ left: spiderSwing.left, top: spiderSwing.top }}>
              <svg width="120" height="220" style={{ position: 'absolute', left: 0, top: 0 }}>
                {/* Web string from button to spider */}
                <line x1="60" y1="0" x2={spiderPos.x} y2={spiderPos.y} stroke="#888" strokeDasharray="4 4" strokeWidth="2" />
                {/* Improved full circular web, revealed progressively */}
                <g stroke="#bbb" strokeWidth="1.1" fill="none">
                  {/* Radial lines */}
                  {webCircle.map((pt,i) => (
                    <line key={i} x1={webCenter.x} y1={webCenter.y} x2={pt.x} y2={pt.y} style={{ opacity: i/RADIALS < webReveal ? 1 : 0 }} />
                  ))}
                  {/* Concentric rings */}
                  {Array.from({length: RINGS}, (_,ri) => {
                    const r = webRadius * (1 - ri/(RINGS+1));
                    return (
                      <circle key={ri} cx={webCenter.x} cy={webCenter.y} r={r} strokeDasharray={Math.PI*2*r} strokeDashoffset={(1-webReveal)*Math.PI*2*r} />
                    );
                  })}
                  {/* Spiral arcs for realism */}
                  {Array.from({length: RINGS-1}, (_,ri) => {
                    const r1 = webRadius * (1 - ri/(RINGS+1));
                    const r2 = webRadius * (1 - (ri+1)/(RINGS+1));
                    return Array.from({length: RADIALS}, (_,i) => {
                      const a1 = (Math.PI * 2 * i) / RADIALS;
                      const a2 = a1 + Math.PI*2/(RADIALS*2);
                      return (
                        <path key={ri+'-'+i} d={spiralArc(webCenter.x, webCenter.y, r1, r2, a1-Math.PI/2, a2-Math.PI/2)} stroke="#ccc" strokeWidth="0.7" style={{ opacity: webReveal }} />
                      );
                    });
                  })}
                </g>
                {/* Text: Great Job! - revealed letter by letter, spider moves along text path */}
                <g>
                  <text x="60" y="180" textAnchor="middle" fontFamily="'Patrick Hand', 'Comic Sans MS', cursive, sans-serif" fontSize="22" fill="#b8860b" stroke="#fff" strokeWidth="0.8" className="spider-text">
                    {Array.from('Great Job!').map((ch, i) => i < Math.ceil(textReveal * 10) ? ch : ' ').join('')}
                  </text>
                </g>
                {/* Spider body at current position */}
                <g transform={`translate(${spiderPos.x - 30},${spiderPos.y - 10})`}>
                  <ellipse cx="30" cy="30" rx="16" ry="18" fill="#222" />
                  <ellipse cx="30" cy="18" rx="10" ry="10" fill="#333" />
                  {/* Eyes */}
                  <circle cx="26" cy="16" r="2.5" fill="#fff" />
                  <circle cx="34" cy="16" r="2.5" fill="#fff" />
                  <circle cx="26" cy="16" r="1.2" fill="#222" />
                  <circle cx="34" cy="16" r="1.2" fill="#222" />
                  {/* Legs */}
                  <path d="M10,30 Q0,20 10,10" stroke="#222" strokeWidth="2" fill="none" />
                  <path d="M50,30 Q60,20 50,10" stroke="#222" strokeWidth="2" fill="none" />
                  <path d="M12,40 Q2,50 18,55" stroke="#222" strokeWidth="2" fill="none" />
                  <path d="M48,40 Q58,50 42,55" stroke="#222" strokeWidth="2" fill="none" />
                  <path d="M16,50 Q8,60 24,58" stroke="#222" strokeWidth="2" fill="none" />
                  <path d="M44,50 Q52,60 36,58" stroke="#222" strokeWidth="2" fill="none" />
                </g>
              </svg>
            </div>
          )}
          <button
            id="btn-signup"
            ref={signupBtnRef}
            type="button"
            aria-label="Sign up for a new account"
            tabIndex={0}
            className="auth-btn signup"
            onMouseEnter={e => e.currentTarget.classList.add('hover')}
            onMouseLeave={e => e.currentTarget.classList.remove('hover')}
            onMouseDown={e => e.currentTarget.classList.add('active')}
            onMouseUp={e => e.currentTarget.classList.remove('active')}
            onClick={handleSignup}
          >
            Sign Up
          </button>
          <button
            id="btn-login"
            type="submit"
            aria-label="Log in to your account"
            tabIndex={0}
            className="auth-btn login"
            onMouseEnter={e => e.currentTarget.classList.add('hover')}
            onMouseLeave={e => e.currentTarget.classList.remove('hover')}
            onMouseDown={e => e.currentTarget.classList.add('active')}
            onMouseUp={e => e.currentTarget.classList.remove('active')}
            onClick={handleLogin}
          >
            Log In
          </button>
        </div>
      </div>
      <div className="auth-tip-box" aria-live="polite">
        <span role="img" aria-label="lightbulb" className="auth-tip-icon">💡</span>
        <b>Goal Setting Tip:</b> <br />
        <span className="auth-tip-quote">{randomTip}</span>
      </div>
    </>
  );
};

export default Auth;