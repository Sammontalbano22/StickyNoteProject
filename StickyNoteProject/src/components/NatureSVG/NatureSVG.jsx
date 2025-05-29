import React from 'react';

const NatureSVG = () => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 420 60"
      style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', overflow: 'visible' }}
    >
      {/* Sun */}
      <g
        style={{
          opacity: 0,
          animation: 'sun-pop 1s 0.7s forwards',
          transformOrigin: '390px -30px',
          transformBox: 'fill-box',
        }}
      >
        {/* ... unchanged sun code ... */}
      </g>
      {/* Butterflies */}
      <g>
        {/* ... unchanged butterfly code ... */}
      </g>
      {/* Stems + Flowers */}
      <g>
        {/* DAISY */}
        <g>
          <path
            d="M18,0 Q18,-4 18,-8"
            stroke="#388e3c"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
            style={{
              strokeDasharray: 8,
              strokeDashoffset: 8,
              vectorEffect: 'non-scaling-stroke',
              animation: 'stem-grow 0.7s 0.1s forwards',
            }}
          />
          <g
            style={{
              opacity: 0,
              transform: 'translate(18px, -8px) scale(0.2)',
              transformOrigin: '18px -8px',
              transformBox: 'fill-box',
              animation: 'flower-bloom 0.5s 0.85s forwards',
            }}
          >
            {/* petals & center */}
          </g>
        </g>
        {/* TULIP */}
        <g>
          <path
            d="M25,0 Q25,-3 25,-6"
            stroke="#6ab04c"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
            style={{
              strokeDasharray: 6,
              strokeDashoffset: 6,
              vectorEffect: 'non-scaling-stroke',
              animation: 'stem-grow 0.7s 0.2s forwards',
            }}
          />
          <g
            style={{
              opacity: 0,
              transform: 'translate(25px, -6px) scale(0.2)',
              transformOrigin: '25px -6px',
              transformBox: 'fill-box',
              animation: 'flower-bloom 0.5s 0.95s forwards',
            }}
          >
            {/* tulip shape */}
          </g>
        </g>
        {/* POPPY */}
        <g>
          <path
            d="M55,0 Q55,-5 55,-10"
            stroke="#7ed957"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
            style={{
              strokeDasharray: 10,
              strokeDashoffset: 10,
              vectorEffect: 'non-scaling-stroke',
              animation: 'stem-grow 0.7s 0.3s forwards',
            }}
          />
          <g
            style={{
              opacity: 0,
              transform: 'translate(55px, -10px) scale(0.2)',
              transformOrigin: '55px -10px',
              transformBox: 'fill-box',
              animation: 'flower-bloom 0.5s 1.05s forwards',
            }}
          >
            {/* poppy petals & center */}
          </g>
        </g>
        {/* ...repeat for each flower, bumping stem-grow delay by ~0.1s and bloom by ~0.1s more... */}
      </g>
      {/* Gradients */}
      <defs>
        <radialGradient id="tulipGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#e1bee7" />
          <stop offset="100%" stopColor="#b39ddb" />
        </radialGradient>
        <radialGradient id="bluebellGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#b3e5fc" />
          <stop offset="100%" stopColor="#0288d1" />
        </radialGradient>
      </defs>
      <style>{`
        @keyframes stem-grow { to { stroke-dashoffset: 0; } }
        @keyframes flower-bloom {
          0%   { opacity: 0; transform: scale(0.2); }
          60%  { opacity: 1; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes sun-pop {
          0%   { opacity: 0; transform: scale(0.2); }
          60%  { opacity: 1; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes butterfly-fly {
          0%   { opacity: 0; transform: translateY(20px) scale(0.2) rotate(-20deg); }
          40%  { opacity: 1; transform: translateY(-10px) scale(1.1) rotate(10deg); }
          60%  { opacity: 1; transform: translateY(0)   scale(1)   rotate(-5deg); }
          100% { opacity: 1; transform: translateY(0)   scale(1)   rotate(0); }
        }
      `}</style>
    </svg>
  );
};

export default NatureSVG;
