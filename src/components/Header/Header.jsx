import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./header.css";

export default function Header({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth data here if you store tokens
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <header className="header">
      <div className="logo" onClick={() => navigate("/")}>
        ReachCode
      </div>

      <nav className="nav">
        <Link to="/">Home</Link>

        {isLoggedIn && <Link to="/dashboard">Dashboard</Link>}

        {!isLoggedIn ? (
          <Link to="/login" className="signin">
            Sign In
          </Link>
        ) : (
          <button onClick={handleLogout} className="signout">
            Sign Out
          </button>
        )}
      </nav>
    </header>
  );
}
