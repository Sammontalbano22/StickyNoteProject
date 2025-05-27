import React, { useState, useRef, useEffect } from 'react';
import { auth } from '../js/firebase-init.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const APP_DESCRIPTION = `The Sticky Note That Changed My Life! Growing up, I always knew I wanted to go to college. I was captivated by the idea of learning from world-class resources and being part of a community that was dedicated to growth. But I also knew the path wouldn’t be easy—college is expensive, and navigating the road to higher education takes more than just ambition.\n\nAt the start of my freshman year of high school, I made two long-term goals:\n\nTo have options when choosing a university\n\nTo attend college on a full-ride scholarship\n\nThese were bold dreams. Less than 1% of students earn a full-ride scholarship, and I was well aware of the odds. But that awareness didn’t discourage me—it pushed me. For the first time in my life, I wrote a goal down. On a small 3x3 sticky note, I wrote: “I will be a Daniels Fund Scholar.” The Daniels Fund is a prestigious full-ride scholarship program in the Southwestern United States, and I stuck that note right next to my bed.\n\nThat sticky note became my compass. On days when I felt motivated, I’d look at it and feel a surge of purpose. And on days when I felt like doing nothing at all, I’d still see it. It reminded me that taking even one small step toward my goal was still progress. It taught me that showing up, consistently, is its own kind of victory.\n\nMy junior year of high school tested that belief. I suffered a traumatic injury that forced me to miss a significant amount of school. When I returned, I felt like a shadow of my former self. But the sticky note was still there. It reminded me why I needed to keep going. Even if all I could do was show up to class, that was still a step.\n\nAfter four years of steady, intentional effort—bit by bit, day by day—I received the life-changing news: I had been selected as a Daniels Fund Scholar. I had earned a full-ride scholarship to study at a university of my choice. That moment will remain one of the most vivid memories of my life. I walked over to the sticky note and, with pride and overwhelming gratitude, crossed it off. That little square of paper became a symbol of resilience, discipline, and unwavering self-belief.\n\nAnyone who has ever set a New Year’s resolution only to give up weeks later knows the truth: long-term goals are hard. In a world of instant gratification, it's difficult to keep striving when the results aren’t immediate. Long-term success demands consistency, habits, and faith in the process.\n\nThat’s why, for my senior design project—an independent study through the Computer Science department at the University of Denver—I’m developing an app inspired by this experience. The app will help users set and stay accountable to their long-term goals, using motivation techniques like habit tracking, reflective prompts, milestone celebrations, and even a virtual progress counselor. My hope is to make long-term goals feel achievable by breaking them down into small day by day goals.`;

const Auth = ({ onLoginSuccess }) => {
  const [showDescription, setShowDescription] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSpider, setShowSpider] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const spiderTimeout = useRef(null);
  const signupBtnRef = useRef(null);
  const [spiderSwing, setSpiderSwing] = useState({ left: 0, top: 0 });

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

  return (
    <>
      <h1
        className="sticky-title sticky-title-large sticky-title-interactive"
        tabIndex={0}
        style={{
          cursor: 'pointer',
          outline: showDescription ? '2.5px solid #f4a261' : 'none',
          transition: 'outline 0.2s cubic-bezier(.4,2,.6,.9), filter 0.35s cubic-bezier(.4,2,.6,.9), transform 0.35s cubic-bezier(.4,2,.6,.9)',
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
      </h1>
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
      }}>
        <input id="email" type="email" placeholder="Email" autoComplete="username" style={{
          fontSize: '1.1em',
          padding: '0.7em 1em',
          borderRadius: 8,
          border: '1.5px solid #bdbdbd',
          background: '#fff',
          boxShadow: '0 1px 4px #f4a26122',
          width: '100%',
          transition: 'border 0.2s, box-shadow 0.2s',
          color: '#4d2600',
        }}
        value={email}
        onChange={e => setEmail(e.target.value)}
        />
        <input id="password" type="password" placeholder="Password" autoComplete="current-password" style={{
          fontSize: '1.1em',
          padding: '0.7em 1em',
          borderRadius: 8,
          border: '1.5px solid #bdbdbd',
          background: '#fff',
          boxShadow: '0 1px 4px #f4a26122',
          width: '100%',
          transition: 'border 0.2s, box-shadow 0.2s',
          color: '#4d2600', // brown font
        }}
        value={password}
        onChange={e => setPassword(e.target.value)}
        />
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
                await signInWithEmailAndPassword(auth, email, password);
                setStatusMsg('✅ Logged in');
                setEmail('');
                setPassword('');
                if (onLoginSuccess) onLoginSuccess();
              } catch (err) {
                setStatusMsg('❌ ' + (err.message || 'Login failed'));
              }
            }}
          >
            Log In
          </button>
        </div>
        <p id="auth-status" style={{ minHeight: 24, margin: 0, color: '#b22222', fontWeight: 500, fontSize: '1em' }}>{statusMsg}</p>
      </div>
    </>
  );
};

export default Auth;

/* Add keyframes for spider swing and web sling */
// In your main.css or in a <style> tag in this file if needed:
// @keyframes spider-swing { 0% { transform: translateY(-60px) rotate(-30deg); } 60% { transform: translateY(0) rotate(10deg); } 100% { transform: translateY(0) rotate(0deg); } }
// @keyframes spider-web { 0% { opacity: 0; } 100% { opacity: 1; } }
// @keyframes spider-web-sling { 0% { opacity: 0; transform: scaleY(0.2); } 100% { opacity: 1; transform: scaleY(1); } }
// @keyframes spider-descend { 0% { transform: translateY(-100px) rotate(0deg); } 100% { transform: translateY(0) rotate(0deg); } }