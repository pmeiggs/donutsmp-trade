import React from 'react';
import './Profile.css';

export default function Profile({ user }) {
  return (
    <div className="profile-container">
      <aside className="profile-sidebar">
        <div className="user-card">
          <div className="user-avatar">👤</div>
          <h3>{user?.name || "Guest"}</h3>
          <span className="rank-tag">{user?.rank || "Newbie"}</span>
        </div>
        <nav className="profile-nav">
          <button className="nav-item active">My Auctions</button>
          <button className="nav-item">Transaction History</button>
          <button className="nav-item">Settings</button>
        </nav>
      </aside>

      <main className="profile-content">
        <div className="content-header">
          <h2>Active Auctions</h2>
          <button className="mc-btn-green">+ Create Auction</button>
        </div>

        <div className="auction-list">
          {/* Example of an active auction */}
          <div className="auction-row">
            <div className="row-info">
              <span className="item-icon">⚔️</span>
              <div>
                <h4>Diamond Sword</h4>
                <p>Sharpness V, Unbreaking III</p>
              </div>
            </div>
            <div className="row-price">50,000 Coins</div>
            <button className="mc-btn-red">Cancel</button>
          </div>
        </div>
      </main>
    </div>
  );
}