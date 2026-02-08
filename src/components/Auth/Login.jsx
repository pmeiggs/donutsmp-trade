import React, { useState } from 'react';
import './Login.css';

export default function Login({ onLogin }) {
  // 1. Create states to hold the input values
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      // 2. Send the data to your RENDER link
      const response = await fetch('https://donuttrade.onrender.com/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 3. If successful, log the user in
        onLogin({ name: data.user, rank: "Player" });
      } else {
        // 4. Show the error message from your server.js (e.g., "Wrong password")
        setError(data.wrongpass || data.nouser || 'Login failed');
      }
    } catch (err) {
      setError('Server is offline or connection failed');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">PLAYER LOGIN</h2>
        
        {/* Display error message if login fails */}
        {error && <p style={{ color: 'red', fontSize: '10px', textAlign: 'center' }}>{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-mc-emerald">USERNAME</label>
            <input 
              type="text" 
              className="custom-input" 
              placeholder="Minecraft Name" 
              value={username}
              onChange={(e) => setUsername(e.target.value)} // Update state
              required
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-mc-emerald">PASSWORD</label>
            <input 
              type="password" 
              className="custom-input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Update state
              required
            />
          </div>

          <button type="submit" className="login-btn bg-mc-grass mt-2">
            JOIN SERVER
          </button>
        </form>
      </div>
    </div>
  );
}