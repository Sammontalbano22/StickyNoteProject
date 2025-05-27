import React, { useState, useRef, useEffect } from 'react';
import { auth } from '../js/firebase-init.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

const APP_DESCRIPTION = `The Sticky Note That Changed My Life! Growing up, I always knew I wanted to go to college. I was captivated by the idea of learning from world-class resources and being part of a community that was dedicated to growth. But I also knew the path wouldn’t be easy—college is expensive, and navigating the road to higher education takes more than just ambition.\n\nAt the start of my freshman year of high school, I made two long-term goals:\n\nTo have options when choosing a university\n\nTo attend college on a full-ride scholarship\n\nThese were bold dreams. Less than 1% of students earn a full-ride scholarship, and I was well aware of the odds. But that awareness didn’t discourage me—it pushed me. For the first time in my life, I wrote a goal down. On a small 3x3 sticky note, I wrote: “I will be a Daniels Fund Scholar.” The Daniels Fund is a prestigious full-ride scholarship program in the Southwestern United States, and I stuck that note right next to my bed.\n\nThat sticky note became my compass. On days when I felt motivated, I’d look at it and feel a surge of purpose. And on days when I felt like doing nothing at all, I’d still see it. It reminded me that taking even one small step toward my goal was still progress. It taught me that showing up, consistently, is its own kind of victory.\n\nMy junior year of high school tested that belief. I suffered a traumatic injury that forced me to miss a significant amount of school. When I returned, I felt like a shadow of my former self. But the sticky note was still there. It reminded me why I needed to keep going. Even if all I could do was show up to class, that was still a step.\n\nAfter four years of steady, intentional effort—bit by bit, day by day—I received the life-changing news: I had been selected as a Daniels Fund Scholar. I had earned a full-ride scholarship to study at a university of my choice. That moment will remain one of the most vivid memories of my life. I walked over to the sticky note and, with pride and overwhelming gratitude, crossed it off. That little square of paper became a symbol of resilience, discipline, and unwavering self-belief.\n\nAnyone who has ever set a New Year’s resolution only to give up weeks later knows the truth: long-term goals are hard. In a world of instant gratification, it's difficult to keep striving when the results aren’t immediate. Long-term success demands consistency, habits, and faith in the process.\n\nThat’s why, for my senior design project—an independent study through the Computer Science department at the University of Denver—I’m developing an app inspired by this experience. The app will help users set and stay accountable to their long-term goals, using motivation techniques like habit tracking, reflective prompts, milestone celebrations, and even a virtual progress counselor. My hope is to make long-term goals feel achievable by breaking them down into small day by day goals.`;

const tipsAndQuotes = [
  "A goal without a plan is just a wish. – Antoine de Saint-Exupéry",
  "Long-term goals keep you moving forward, even when progress feels slow.",
  "Success is the sum of small efforts, repeated day in and day out. – Robert Collier",
  "Dream big, start small, act now.",
  "The secret to getting ahead is getting started. – Mark Twain",
  "Discipline is the bridge between goals and accomplishment. – Jim Rohn",
  "You don’t have to be great to start, but you have to start to be great. – Zig Ziglar",
  "Stay patient and trust your journey.",
  "Every accomplishment starts with the decision to try.",
  "Set a goal so big you can’t achieve it until you grow into the person who can.",
  "The future depends on what you do today. – Mahatma Gandhi",
  "It always seems impossible until it’s done. – Nelson Mandela",
  "Small steps every day add up to big results.",
  "Your goals are the road maps that guide you and show you what is possible for your life. – Les Brown",
  "Don’t watch the clock; do what it does. Keep going. – Sam Levenson"
];

// Useful tips and quotes for long-term goal setting
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

const Auth = ({ onLoginSuccess }) => {
  const [showDescription, setShowDescription] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSpider, setShowSpider] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const spiderTimeout = useRef(null);
  const signupBtnRef = useRef(null);
  const [spiderSwing, setSpiderSwing] = useState({ left: 0, top: 0 });
  const [randomTip, setRandomTip] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Easter egg: show spider if 'spider' is typed in email
  useEffect(() => {
    if (email.trim().toLowerCase() === 'spider') {
      setShowSpider(true);
      // Hide after 5 seconds
      clearTimeout(spiderTimeout.current);
      spiderTimeout.current = setTimeout(() => setShowSpider(false), 5000);
    } else {
      setShowSpider(false);
      clearTimeout(spiderTimeout.current);
    }
    return () => clearTimeout(spiderTimeout.current);
  }, [email]);

  // Update spider position when showSpider or window resizes
  useEffect(() => {
    if (showSpider && signupBtnRef.current) {
      const btnRect = signupBtnRef.current.getBoundingClientRect();
      // Bottom center of the Sign Up button
      setSpiderSwing({
        left: btnRect.left + btnRect.width / 2 - 30, // center spider (svg width/2)
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

  // --- Spider Web Animation State ---
  const [spiderPhase, setSpiderPhase] = useState(0); // 0: descend, 1: web, 2: text, 3: done
  const [spiderPos, setSpiderPos] = useState({ x: 60, y: 60 }); // SVG coords
  const [webReveal, setWebReveal] = useState(0); // 0-1, percent of web drawn
  const [textReveal, setTextReveal] = useState(0); // 0-1, percent of text drawn

  // Improved circular web: more radial lines, more concentric rings, and spiral arcs
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

  // Spiral arcs for realism
  function spiralArc(cx, cy, r1, r2, a1, a2) {
    // Returns SVG path for an arc from angle a1 to a2, radius r1 to r2
    const p1x = cx + r1 * Math.cos(a1);
    const p1y = cy + r1 * Math.sin(a1);
    const p2x = cx + r2 * Math.cos(a2);
    const p2y = cy + r2 * Math.sin(a2);
    const largeArc = a2 - a1 > Math.PI ? 1 : 0;
    return `M${p1x},${p1y} A${(r1+r2)/2},${(r1+r2)/2} 0 ${largeArc} 1 ${p2x},${p2y}`;
  }

  // Path for 'Great Job!' (approximate, center bottom)
  const textPath = [
    {x:60, y:165}, {x:65, y:170}, {x:70, y:175}, {x:75, y:170}, {x:80, y:165},
    {x:85, y:170}, {x:90, y:175}, {x:95, y:170}, {x:100, y:165},
  ];

  // Reset animation state when spider appears
  useEffect(() => {
    if (showSpider) {
      setSpiderPhase(0);
      setSpiderPos({ x: 60, y: 60 });
      setWebReveal(0);
      setTextReveal(0);
    }
  }, [showSpider]);

  // Animation sequence
  useEffect(() => {
    if (!showSpider) return;
    let raf;
    let start;
    function animate(ts) {
      if (!start) start = ts;
      const t = (ts - start) / 1000;
      if (spiderPhase === 0) {
        // Descend to web center
        setSpiderPos({ x: 60, y: 60 + Math.min(50, t * 80) });
        if (t > 0.7) { setSpiderPhase(1); start = ts; }
      } else if (spiderPhase === 1) {
        // Move spider around web circle, revealing web
        const reveal = Math.min(1, t / 2.2);
        setWebReveal(reveal);
        const idx = Math.floor(reveal * (webCircle.length-1));
        setSpiderPos(webCircle[idx]);
        if (reveal >= 1) { setWebReveal(1); setSpiderPhase(2); start = ts; }
      } else if (spiderPhase === 2) {
        // Move spider along text path, revealing text
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

  // Set a random tip/quote on mount
  useEffect(() => {
    setRandomTip(GOAL_TIPS[Math.floor(Math.random() * GOAL_TIPS.length)]);
  }, []);

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
        className="sticky-title sticky-title-large sticky-title-interactive"
        tabIndex={0}
        style={{
          cursor: 'pointer',
          outline: showDescription ? '2.5px solid #f4a261' : 'none',
          transition: 'outline 0.2s cubic-bezier(.4,2,.6,.9), filter 0.35s cubic-bezier(.4,2,.6,.9), transform 0.35s cubic-bezier(.4,2,.6,.9)',
          background: '#fff', // Make the whole button white
          color: '#4d2600',
          borderRadius: 12,
          boxShadow: showDescription ? '0 2px 8px #f4a26144' : '0 1px 4px #f4a26122',
          padding: '0.25em 1.2em',
          display: 'inline-block',
        }}
        onClick={() => setShowDescription((v) => !v)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowDescription(v => !v); }}
        aria-expanded={showDescription}
        aria-controls="app-description"
        title="Click to learn more about this app"
      >
        <span style={{
          display: 'inline-block',
          transition: 'transform 0.35s cubic-bezier(.4,2,.6,.9), filter 0.35s cubic-bezier(.4,2,.6,.9)',
          transform: showDescription ? 'scale(1.04) rotate(-2deg)' : 'none',
          filter: showDescription ? 'drop-shadow(0 6px 18px #f4a26144)' : 'none',
        }}>
          The Sticky Note Project
        </span>
        <span
          aria-hidden="true"
          style={{
            marginLeft: 12,
            fontSize: '0.7em',
            verticalAlign: 'middle',
            opacity: 0.7,
            transition: 'transform 0.35s cubic-bezier(.4,2,.6,.9)',
            transform: showDescription ? 'rotate(90deg)' : 'rotate(0deg)',
            display: 'inline-block',
          }}
        >
          {showDescription ? '▲' : '▼'}
        </span>
        {/* Add gentle bounce animation style */}
        <style>{`
          @keyframes gentle-bounce {
            0% { transform: scale(1) rotate(0deg); }
            10% { transform: scale(1.04,0.97) rotate(-2deg); }
            18% { transform: scale(0.98,1.03) rotate(2deg); }
            26% { transform: scale(1.03,0.98) rotate(-1.5deg); }
            34% { transform: scale(1,1) rotate(0deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
        `}</style>
      </h1>
      {/* Attractive, non-intrusive UI prompt to click the title */}
      {!showDescription && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          margin: '0.2em 0 0.7em 0',
        }}>
          <div style={{
            background: 'rgba(255, 224, 130, 0.78)', // reverted from solid white back to semi-transparent yellow
            color: '#4d2600',
            border: '1px dashed #f4a261',
            borderRadius: '12px 16px 14px 18px/18px 14px 16px 12px',
            boxShadow: '0 1px 6px #f4a26118',
            fontFamily: 'Patrick Hand, Comic Sans MS, cursive, sans-serif',
            fontSize: '1em',
            padding: '0.45em 1em',
            display: 'flex', alignItems: 'center', gap: 8,
            animation: 'fade-in-pulse 1.2s',
            cursor: 'pointer',
            userSelect: 'none',
            maxWidth: 340,
            opacity: 0.92,
            transition: 'background 0.2s, opacity 0.2s',
          }}
            tabIndex={0}
            onClick={() => setShowDescription(true)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowDescription(true); }}
            aria-label="Click to learn more about this app"
          >
            <span style={{ fontSize: '1.1em', marginRight: 4 }}>💡</span>
            <span style={{ fontWeight: 500 }}>Tip: <b>Click the Sticky Note Project title</b> to learn the story!</span>
            <span style={{ fontSize: '1em', marginLeft: 4, opacity: 0.6 }}>👆</span>
          </div>
          <style>{`
            @keyframes fade-in-pulse {
              0% { opacity: 0; transform: scale(0.95); }
              60% { opacity: 1; transform: scale(1.04); }
              100% { opacity: 0.85; transform: scale(1); }
            }
          `}</style>
        </div>
      )}
      {/* Spider and web attached to Sign Up button only */}
      {showSpider && (
        <div style={{
          position: 'fixed',
          left: spiderSwing.left,
          top: spiderSwing.top,
          width: 120,
          height: 220,
          pointerEvents: 'none',
          zIndex: 1001,
          transformOrigin: '60px 0px',
        }}>
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
              <text x="60" y="180" textAnchor="middle" fontFamily="'Patrick Hand', 'Comic Sans MS', cursive, sans-serif" fontSize="22" fill="#b8860b" stroke="#fff" strokeWidth="0.8" style={{ filter: 'drop-shadow(0 2px 4px #fffbe8)', fontWeight: 900, letterSpacing: 1.5, textShadow: '0 2px 4px #fffbe8', opacity: 0.95, fontStyle: 'italic' }}>
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
        style={{
          maxHeight: showDescription ? 1200 : 0,
          opacity: showDescription ? 1 : 0,
          overflow: 'hidden',
          background: '#fffbe8',
          border: '2px solid #f4a261',
          borderRadius: '14px',
          boxShadow: '0 4px 18px rgba(244,163,97,0.10)',
          padding: showDescription ? '1.5em' : '0 1.5em',
          margin: '0 auto 1.5em auto',
          maxWidth: 600,
          fontFamily: 'Patrick Hand, Comic Sans MS, cursive, sans-serif',
          fontSize: '1.1em',
          color: '#4d2600',
          whiteSpace: 'pre-line',
          textAlign: 'left',
          lineHeight: 1.6,
          boxSizing: 'border-box',
          transition: 'max-height 0.5s cubic-bezier(.4,2,.6,.9), opacity 0.3s, padding 0.3s',
        }}
        aria-hidden={!showDescription}
      >
        {APP_DESCRIPTION}
      </div>
      {/* Login box wrapper for perfect centering */}
      <div className="login-box" style={{
        width: 260,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.7em',
      }}
      role="form"
      aria-labelledby="login-form-title"
      >
        <input
          id="email"
          type="email"
          placeholder="Email"
          autoComplete="username"
          aria-label="Email address"
          aria-required="true"
          style={{
            fontSize: '1.1em',
            padding: '0.7em 1em',
            borderRadius: 8,
            border: '1.5px solid #bdbdbd',
            background: '#fff',
            boxShadow: '0 1px 4px #f4a26122',
            width: '100%',
            transition: 'border 0.2s, box-shadow 0.2s',
            color: '#4d2600',
            boxSizing: 'border-box',
          }}
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box', height: 48 }}>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            autoComplete="current-password"
            aria-label="Password"
            aria-required="true"
            style={{
              fontSize: '1.1em',
              padding: '0.7em 1em',
              borderRadius: 8,
              border: '1.5px solid #bdbdbd',
              background: '#fff',
              boxShadow: '0 1px 4px #f4a26122',
              width: '100%',
              transition: 'border 0.2s, box-shadow 0.2s',
              color: '#4d2600',
              boxSizing: 'border-box',
              height: 48,
            }}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={0}
            onClick={() => setShowPassword(v => !v)}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.1em',
              color: '#b8860b',
              padding: 0,
              zIndex: 2,
              height: 32,
              width: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        <div style={{ width: '100%', textAlign: 'right', marginTop: '-0.3em', marginBottom: '0.2em' }}>
          <button
            type="button"
            aria-label="Forgot password? Send password reset email"
            tabIndex={0}
            style={{
              background: 'none',
              border: 'none',
              color: '#b8860b',
              fontFamily: 'Patrick Hand, Comic Sans MS, cursive, sans-serif',
              fontSize: '0.98em',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              margin: 0,
              outline: 'none',
              transition: 'color 0.18s',
            }}
            onClick={async () => {
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
            }}
          >
            Forgot password?
          </button>
        </div>
        {/* Button row wrapper for perfect centering */}
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1em',
          marginTop: 8,
          position: 'relative', // for spider absolute positioning
        }}>
          {/* Only render the new spider here, remove any previous/duplicate spider blocks */}
          {showSpider && (
            <div style={{
              position: 'fixed',
              left: spiderSwing.left,
              top: spiderSwing.top,
              width: 120,
              height: 220,
              pointerEvents: 'none',
              zIndex: 1001,
              transformOrigin: '60px 0px',
            }}>
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
                  <text x="60" y="180" textAnchor="middle" fontFamily="'Patrick Hand', 'Comic Sans MS', cursive, sans-serif" fontSize="22" fill="#b8860b" stroke="#fff" strokeWidth="0.8" style={{ filter: 'drop-shadow(0 2px 4px #fffbe8)', fontWeight: 900, letterSpacing: 1.5, textShadow: '0 2px 4px #fffbe8', opacity: 0.95, fontStyle: 'italic' }}>
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
            style={{
              background: '#ffe082',
              color: '#4d2600',
              border: '2.5px dashed #f4a261',
              borderRadius: '14px 18px 12px 16px/16px 12px 18px 14px', // playful, uneven corners
              padding: '0.85em 0',
              fontWeight: 900,
              fontSize: '1.13em',
              fontFamily: 'Patrick Hand, Comic Sans MS, cursive, sans-serif',
              boxShadow: '0 6px 18px #f4a26144, 0 2px 0 #fffbe8 inset',
              cursor: 'pointer',
              letterSpacing: '0.7px',
              outline: 'none',
              minWidth: 0,
              width: '48%',
              transform: 'rotate(-2.5deg)',
              transition: 'box-shadow 0.18s, background 0.18s, transform 0.18s',
              position: 'relative',
              userSelect: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 32px #f4a26155, 0 2px 0 #fffbe8 inset'; e.currentTarget.style.background = '#ffecb3'; e.currentTarget.style.transform = 'rotate(-2.5deg) scale(1.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 6px 18px #f4a26144, 0 2px 0 #fffbe8 inset'; e.currentTarget.style.background = '#ffe082'; e.currentTarget.style.transform = 'rotate(-2.5deg) scale(1)'; }}
            onMouseDown={e => e.currentTarget.style.transform = 'rotate(-2.5deg) scale(0.97)'}
            onMouseUp={e => e.currentTarget.style.transform = 'rotate(-2.5deg) scale(1.04)'}
            onClick={async e => {
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
            }}
          >
            Sign Up
          </button>
          <button
            id="btn-login"
            type="submit"
            aria-label="Log in to your account"
            tabIndex={0}
            style={{
              background: '#ffe082',
              color: '#4d2600',
              border: '2.5px dashed #f4a261',
              borderRadius: '16px 12px 18px 14px/14px 18px 12px 16px',
              padding: '0.85em 0',
              fontWeight: 900,
              fontSize: '1.13em',
              fontFamily: 'Patrick Hand, Comic Sans MS, cursive, sans-serif',
              boxShadow: '0 6px 18px #f4a26144, 0 2px 0 #fffbe8 inset',
              cursor: 'pointer',
              letterSpacing: '0.7px',
              outline: 'none',
              minWidth: 0,
              width: '48%',
              transform: 'rotate(2.5deg)',
              transition: 'box-shadow 0.18s, background 0.18s, transform 0.18s',
              position: 'relative',
              userSelect: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 32px #f4a26155, 0 2px 0 #fffbe8 inset'; e.currentTarget.style.background = '#ffecb3'; e.currentTarget.style.transform = 'rotate(2.5deg) scale(1.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 6px 18px #f4a26144, 0 2px 0 #fffbe8 inset'; e.currentTarget.style.background = '#ffe082'; e.currentTarget.style.transform = 'rotate(2.5deg) scale(1)'; }}
            onMouseDown={e => e.currentTarget.style.transform = 'rotate(2.5deg) scale(0.97)'}
            onMouseUp={e => e.currentTarget.style.transform = 'rotate(2.5deg) scale(1.04)'}
            onClick={async e => {
              e.preventDefault();
              if (!email || !password) {
                setStatusMsg('Please enter your email and password.');
                return;
              }
              try {
                const { setPersistence, browserLocalPersistence, browserSessionPersistence } = await import('firebase/auth');
                await setPersistence(auth, browserSessionPersistence);
                await signInWithEmailAndPassword(auth, email, password);
                setStatusMsg('✅ Logged in');
                setEmail('');
                setPassword('');
                if (onLoginSuccess) onLoginSuccess();
              } catch (err) {
                setStatusMsg('❌ ' + (err.message || 'Log in failed'));
              }
            }}
          >
            Log In
          </button>
        </div>
      </div>
      {/* Tips/Quotes box below login */}
      <div
        style={{
          margin: '1.2em auto 0 auto',
          maxWidth: 340,
          background: '#fffbe8',
          border: '2px dashed #f4a261',
          borderRadius: '14px',
          boxShadow: '0 2px 8px #f4a26122',
          padding: '1em 1.2em',
          fontFamily: 'Patrick Hand, Comic Sans MS, cursive, sans-serif',
          fontSize: '1.08em',
          color: '#4d2600',
          textAlign: 'center',
          lineHeight: 1.5,
          letterSpacing: '0.2px',
          userSelect: 'none',
          opacity: 0.97,
        }}
        aria-live="polite"
      >
        <span role="img" aria-label="lightbulb" style={{marginRight: 6}}>💡</span>
        <b>Goal Setting Tip:</b> <br />
        <span style={{fontStyle: 'italic'}}>{randomTip}</span>
      </div>
    </>
  );
}

export default Auth;