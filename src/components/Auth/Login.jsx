import React, { useState } from 'react';
import './Login.css';

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ name: "Player123", rank: "MVP" });
  };

return (
  <div className="login-page">
    <div className="login-card">
      <h2 className="login-title">PLAYER LOGIN</h2>
      
    <form onSubmit={handleSubmit} className="flex flex-col gap-6"> {/* Increased gap here */}
  <div className="flex flex-col gap-2">
    <label className="text-xs font-black text-mc-emerald">USERNAME</label>
    <input type="text" className="custom-input" placeholder="Minecraft Name" />
  </div>
  
  <div className="flex flex-col gap-2">
    <label className="text-xs font-black text-mc-emerald">PASSWORD</label>
    <input type="password" className="custom-input" placeholder="••••••••" />
  </div>

  <button type="submit" className="login-btn bg-mc-grass mt-2">
    JOIN SERVER
  </button>
</form>
    </div>
  </div>
);
}