import React from 'react';

const Header = () => (
  <header>
    <h1>🎯 My Long-Term Goal Board</h1>
    <div id="progress-bar">
      <div id="progress-fill"></div>
    </div>
    <button id="btn-logout" style={{ display: 'none' }}>🚪 Sign Out</button>
  </header>
);

export default Header;