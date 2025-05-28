import React, { useState, useEffect, useRef } from 'react';
import HabitTracker from './HabitTracker';

// Default widget types
const WIDGET_TYPES = [
  { type: 'quote', label: 'Inspirational Quote' },
  { type: 'image', label: 'Image' },
  { type: 'playlist', label: 'Playlist' },
  { type: 'habit', label: 'Habit Tracker' }, // Added Habit Tracker
];

const SPOTIFY_WIDTH = 340;
const SPOTIFY_HEIGHT = 80;
const WIDGET_WIDTH = SPOTIFY_WIDTH;
const WIDGET_HEIGHT = SPOTIFY_HEIGHT;

// Persona options
const COACH_PERSONAS = [
  { value: 'cheerleader', label: 'Cheerleader' },
  { value: 'accountability', label: 'Accountability Partner' },
  { value: 'gentle', label: 'Gentle Guide' },
  { value: 'custom', label: 'Custom' },
];

// WidgetsArea: standalone area for displaying widgets above the sticky note goals
const WidgetsArea = ({ widgets, onRemove, onMove, onDragStart, onDragOver, onDrop, draggingIdx }) => (
  <div style={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: 28,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    margin: '0 auto -96px auto', // negative bottom margin to move up the rest of the page by ~1 inch (96px)
    maxWidth: 1200,
    minHeight: widgets.length ? WIDGET_HEIGHT : 0,
    position: 'relative',
    zIndex: 10,
    padding: '0 18px',
    transition: 'min-height 0.3s',
  }}>
    {widgets.map((w, idx) => (
      <div
        key={idx}
        draggable
        onDragStart={e => onDragStart(e, idx)}
        onDragOver={e => onDragOver(e, idx)}
        onDrop={e => onDrop(e, idx)}
        onDragEnd={e => onDrop(e, null)}
        style={{
          boxSizing: 'border-box',               // ← new line
          background: '#fff',
          borderRadius: 24,
          boxShadow: draggingIdx === idx
            ? '0 8px 32px #44bba4cc, 0 2px 0 #fffbe8 inset'
            : '0 4px 18px #f4a26133, 0 2px 0 #fffbe8 inset',
          padding: w.type === 'playlist' ? 0 : 24,
          minWidth: WIDGET_WIDTH,
          maxWidth: WIDGET_WIDTH,
          minHeight: WIDGET_HEIGHT,
          maxHeight: WIDGET_HEIGHT,
          width: WIDGET_WIDTH,
          height: WIDGET_HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          marginBottom: 18,
          border: draggingIdx === idx
            ? '3px solid #44bba4'
            : '2.5px solid #ffd1dc',
          transition: 'box-shadow 0.18s, border 0.18s, transform 0.18s',
          cursor: 'grab',
          outline: draggingIdx === idx ? '2px solid #44bba4' : 'none',
          overflow: 'hidden',
          wordBreak: 'break-word',
          zIndex: draggingIdx === idx ? 100 : 10,
          opacity: draggingIdx === idx ? 0.7 : 1,
          animation: 'pop-in 0.5s cubic-bezier(.4,2,.6,.9)',
          backgroundImage:
            w.type === 'quote'
              ? 'linear-gradient(135deg, #ffd1dc 80%, #fffbe8 100%)'
              : w.type === 'image'
                ? 'linear-gradient(135deg, #b3e5fc 80%, #fffbe8 100%)'
                : 'linear-gradient(135deg, #dcedc8 80%, #fffbe8 100%)',
        }}
        tabIndex={0}
      >
        {/* Remove button */}
        <button
          onClick={() => onRemove(idx)}
          style={{
            position: 'absolute',
            top: 10,
            left: 14, // move X to top left
            background: 'rgba(255,255,255,0.85)',
            color: '#e76f51',
            border: 'none',
            fontWeight: 900,
            fontSize: 18,
            cursor: 'pointer',
            opacity: 0.7,
            borderRadius: 16,
            boxShadow: '0 1px 4px #ffd1dc33',
            transition: 'opacity 0.18s',
            zIndex: 20,
            width: 28,
            height: 28,
            lineHeight: '20px',
            padding: 0
          }}
          title="Remove"
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
        >×</button>
        {/* Content rendering */}
        {w.type === 'quote' && (
          <div style={{
            fontStyle: 'italic',
            fontSize: 22,
            color: '#4d2600',
            lineHeight: 1.4,
            textShadow: '0 1px 4px #fffbe8',
            textAlign: 'center',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            padding: 0,
            margin: 0,
            overflow: 'hidden',
            background: 'transparent',
            position: 'absolute',
            top: 0,
            left: 0,
          }}>
            <span style={{
              width: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'pre-line',
              display: 'block'
            }}>
              &ldquo;{w.content}&rdquo;
            </span>
          </div>
        )}
        {w.type === 'image' && (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            margin: 0,
            boxSizing: 'border-box',
            overflow: 'hidden',
            background: 'transparent'
          }}>
            <img
              src={w.content}
              alt="widget"
              style={{
                width: '100%',
                height: '50%',
                borderRadius: 16,
                boxShadow: '0 2px 12px #b3e5fc44',
                objectFit: 'cover',
                background: '#fff',
                maxWidth: '100%',
                maxHeight: '50%',
                display: 'block'
              }}
            />
          </div>
        )}
        {w.type === 'playlist' && w.content && (() => {
            let embedUrl = w.content.trim();
            const iframeSrcMatch = embedUrl.match(/<iframe[^>]+src=["']([^"']+)["']/i);
            if (iframeSrcMatch) embedUrl = iframeSrcMatch[1];
            const match = embedUrl.match(/^https:\/\/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)(\?.*)?$/);
            if (match) embedUrl = `https://open.spotify.com/embed/playlist/${match[1]}?utm_source=generator`;
            const embedMatch = embedUrl.match(/^https:\/\/open\.spotify\.com\/embed\/playlist\/([a-zA-Z0-9]+)(\?[^#]*)?$/);
            if (!embedMatch) {
              return (
                <div style={{
                  color: '#e76f51',
                  fontSize: 14,
                  marginBottom: 8,
                  maxWidth: 220,
                  textAlign: 'center'
                }}>
                  Invalid Spotify playlist link. Please paste a valid Spotify playlist link or embed URL.<br/>
                  Example: https://open.spotify.com/playlist/xxxxxx
                </div>
              );
            }
            const playlistId = embedMatch[1];
            let query = embedMatch[2] || '';
            if (!query.includes('theme=0')) {
              query += (query ? '&' : '?') + 'theme=0';
            }
            const safeEmbedUrl = `https://open.spotify.com/embed/playlist/${playlistId}${query}`;
            return (
              <iframe
                src={safeEmbedUrl}
                title="Spotify Playlist"
                width={SPOTIFY_WIDTH}
                height={SPOTIFY_HEIGHT}
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-popups"
                style={{ borderRadius: 24, background: '#fff', display: 'block', width: '100%', height: '100%' }}
              />
            );
          })()
        }
        {w.type === 'habit' && (
          <div style={{ width: '100%', height: '100%' }}>
            {/* Render the HabitTracker widget */}
            <HabitTracker />
          </div>
        )}
        {/* Goal tag pill */}
        {w.goal && w.goal.trim() && (
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(90deg, #ffe082 60%, #ffd1dc 100%)',
            color: '#b35c00',
            fontWeight: 700,
            fontSize: 15,
            borderRadius: 18,
            padding: '5px 18px',
            marginTop: 8,
            letterSpacing: 0.2,
            boxShadow: '0 2px 8px #ffd1dc33',
            border: '1.5px solid #ffd1dc',
            maxWidth: 210,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            position: 'absolute',
            left: 18,
            bottom: 12,
            zIndex: 12,
          }} title={w.goal}>
            🎯 {w.goal}
          </div>
        )}
      </div>
    ))}
  </div>
);

// App component
const App = () => {
  const [widgets, setWidgets] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('widgetBar_widgets') || '[]');
    } catch {
      return [];
    }
  });
  const [adding, setAdding] = useState(false);
  const [newWidget, setNewWidget] = useState({ type: 'quote', content: '', goal: '' });
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [coachPersona, setCoachPersona] = useState(() => {
    return localStorage.getItem('coach_persona') || 'cheerleader';
  });

  useEffect(() => {
    localStorage.setItem('widgetBar_widgets', JSON.stringify(widgets));
  }, [widgets]);
  useEffect(() => {
    localStorage.setItem('coach_persona', coachPersona);
  }, [coachPersona]);

  const handleAddWidget = () => {
    // For habit tracker, allow empty content
    if (newWidget.type !== 'habit' && !newWidget.content.trim()) return;
    setWidgets(w => [...w, { ...newWidget }]);
    setNewWidget({ type: 'quote', content: '', goal: '' });
    setAdding(false);
  };
  const handleRemoveWidget = idx => setWidgets(w => w.filter((_, i) => i !== idx));

  const handleDragStart = (e, idx) => {
    setDraggingIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (draggingIdx === null || draggingIdx === idx) return;
    setWidgets(w => {
      const arr = [...w];
      const [dragged] = arr.splice(draggingIdx, 1);
      arr.splice(idx, 0, dragged);
      return arr;
    });
    setDraggingIdx(idx);
  };
  const handleDrop = () => setDraggingIdx(null);

  return (
    <div>
      <WidgetsArea
        widgets={widgets}
        onRemove={handleRemoveWidget}
        onMove={() => {}}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        draggingIdx={draggingIdx}
      />
      {/* ...existing code for goals and other components... */}
      <button
        onClick={() => setAdding(true)}
        style={{
          position: 'fixed',
          left: 10,
          bottom: 110, // match Virtual Counselor's bottom
          top: 'auto',
          transform: 'none',
          background: 'linear-gradient(90deg, #ffe082 80%, #ffd1dc 100%)',
          color: '#b35c00',
          border: '2.5px solid #ffd1dc',
          borderRadius: 22, // all corners fully rounded
          fontWeight: 900,
          fontSize: 22,
          fontFamily: 'Inter, Segoe UI, Arial, sans-serif', // Modern, bold, non-cursive
          padding: '16px 38px 16px 24px',
          cursor: 'pointer',
          minWidth: 180,
          zIndex: 3000,
          boxShadow: '0 4px 24px #ffd1dc55',
          transition: 'box-shadow 0.18s, background 0.18s',
          animation: 'pop-in 0.5s cubic-bezier(.4,2,.6,.9)',
        }}
      >
        + Add Widget
      </button>
      {adding && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            border: '2.5px solid #ffd1dc',
            borderRadius: 22,
            padding: 32,
            minWidth: 320,
            maxWidth: 380,
            boxShadow: '0 8px 32px #ffd1dc55',
            display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'stretch',
            position: 'relative',
            animation: 'pop-in 0.5s cubic-bezier(.4,2,.6,.9)',
          }}>
            <label style={{ fontWeight: 900, fontSize: 18, color: '#b35c00', marginBottom: 2 }}>
              Widget Type
            </label>
            <select
              value={newWidget.type}
              onChange={e => setNewWidget(w => ({ ...w, type: e.target.value }))}
              style={{
                fontSize: 16,
                borderRadius: 10,
                border: '1.5px solid #ffd1dc',
                padding: '8px 12px',
                marginBottom: 2
              }}
            >
              {WIDGET_TYPES.map(t => (
                <option key={t.type} value={t.type}>
                  {t.label}
                </option>
              ))}
            </select>
            {newWidget.type === 'quote' && (
              <input
                type="text"
                placeholder="Enter quote"
                value={newWidget.content}
                onChange={e => setNewWidget(w => ({ ...w, content: e.target.value }))}
                style={{
                  fontSize: 16,
                  borderRadius: 10,
                  border: '1.5px solid #ffd1dc',
                  padding: '8px 12px',
                  marginBottom: 2
                }}
              />
            )}
            {newWidget.type === 'image' && (
              <input
                type="url"
                placeholder="Image URL"
                value={newWidget.content}
                onChange={e => setNewWidget(w => ({ ...w, content: e.target.value }))}
                style={{
                  fontSize: 16,
                  borderRadius: 10,
                  border: '1.5px solid #ffd1dc',
                  padding: '8px 12px',
                  marginBottom: 2
                }}
              />
            )}
            {newWidget.type === 'playlist' && (
              <>
                <input
                  type="url"
                  placeholder="Paste Spotify playlist link, embed URL, or iframe HTML"
                  value={newWidget.content}
                  onChange={e => setNewWidget(w => ({ ...w, content: e.target.value }))}
                  style={{
                    fontSize: 16,
                    borderRadius: 10,
                    border: '1.5px solid #ffd1dc',
                    padding: '8px 12px',
                    marginBottom: 2
                  }}
                />
                <a
                  href="https://open.spotify.com/collection/playlists"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 14,
                    color: '#1db954',
                    fontWeight: 700,
                    textDecoration: 'underline',
                    margin: '2px 0 6px'
                  }}
                >
                  Browse your Spotify playlists
                </a>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>
                  Paste a playlist link (e.g. https://open.spotify.com/playlist/...)
                  <br />
                  <span style={{ color: '#b35c00' }}>Tip:</span> To get the embed URL, click the
                  three dots on a playlist in Spotify → Share → "Embed playlist".
                </div>
              </>
            )}
            {newWidget.type === 'habit' && (
              <div style={{ fontSize: 15, color: '#888', marginBottom: 8 }}>
                The Habit Tracker widget helps you check off daily habits. No extra setup needed!
              </div>
            )}
            <label style={{
              fontWeight: 900,
              fontSize: 16,
              color: '#b35c00',
              marginTop: 4
            }}>
              Relate to Goal
            </label>
            <select
              value={newWidget.goal}
              onChange={e => setNewWidget(w => ({ ...w, goal: e.target.value }))}
              style={{
                fontSize: 15,
                borderRadius: 10,
                border: '1.5px solid #ffd1dc',
                padding: '8px 12px',
                marginBottom: 2
              }}
            >
              <option value="">(Optional)</option>
              {[
                { text: 'Goal 1' },
                { text: 'Goal 2' },
                { text: 'Goal 3' },
              ].map((g, i) => (
                <option key={i} value={g.text}>
                  {g.text}
                </option>
              ))}
            </select>
            <div style={{
              display: 'flex',
              gap: 14,
              marginTop: 10,
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleAddWidget}
                style={{
                  background: '#44bba4',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 900,
                  fontSize: 16,
                  padding: '8px 28px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 8px #44bba433'
                }}
              >
                Add
              </button>
              <button
                onClick={() => setAdding(false)}
                style={{
                  background: '#ffd1dc',
                  color: '#4d2600',
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 900,
                  fontSize: 16,
                  padding: '8px 28px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 8px #ffd1dc33'
                }}
              >
                Cancel
              </button>
            </div>
            <button
              onClick={() => setAdding(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 18,
                background: 'none',
                color: '#e76f51',
                border: 'none',
                fontWeight: 900,
                fontSize: 28,
                cursor: 'pointer',
                opacity: 0.7,
                zIndex: 10
              }}
              title="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes pop-in {
          0% { transform: scale(0.7) rotate(-6deg); opacity: 0; }
          60% { transform: scale(1.08) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default App;
