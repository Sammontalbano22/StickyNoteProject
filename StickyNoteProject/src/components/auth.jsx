import React, { useState } from 'react';

const Auth = () => {
return (
//  <!-- Authentication UI -->
  <div id="auth">
    <input id="email" type="email" placeholder="Email" />
    <input id="password" type="password" placeholder="Password" />
    <button id="btn-signup">Sign Up</button>
    <button id="btn-login">Log In</button>
    <p id="auth-status"></p>
  </div>
)
}

export default Auth;