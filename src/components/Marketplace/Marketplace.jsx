import React, { useState } from 'react';
import './Marketplace.css';

const MOCK_TRADES = [
  { id: 1, item: "Netherite Ingot", qty: 2, user: "Steve_01", price: "64 Diamonds", rarity: "Legendary", trust: 98 },
  { id: 2, item: "Enchanted Book", qty: 1, user: "Alex_Builds", price: "12 Emeralds", rarity: "Epic", trust: 100 },
  { id: 3, item: "Golden Apple", qty: 5, user: "CreeperGuy", price: "32 Gold", rarity: "Rare", trust: 85 },
  { id: 4, item: "Elytra", qty: 1, user: "Enderman_88", price: "Offer", rarity: "Legendary", trust: 92 },
];

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="marketplace-container">
      {/* Search & Filter Bar */}
      <section className="search-section">
        <input 
          type="text" 
          placeholder="Search items (Diamonds, Swords...)" 
          className="mc-input search-bar"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="filter-tags">
          <span className="tag active">All</span>
          <span className="tag">Blocks</span>
          <span className="tag">Tools</span>
          <span className="tag">Food</span>
        </div>
      </section>

      {/* The Marketplace Grid */}
      <div className="items-grid">
        {MOCK_TRADES.filter(t => t.item.toLowerCase().includes(searchTerm.toLowerCase())).map((trade) => (
          <div key={trade.id} className={`trade-card ${trade.rarity.toLowerCase()}`}>
            <div className="item-preview">
              {/* Icon placeholder - You can replace these with images later */}
              <span className="item-icon">📦</span>
              <span className="item-qty">x{trade.qty}</span>
            </div>
            
            <div className="item-info">
              <h3 className="item-name">{trade.item}</h3>
              <div className="user-badge">
                <span className="username">@{trade.user}</span>
                <span className="trust-score">⭐ {trade.trust}%</span>
              </div>
              
              <div className="price-box">
                <span className="label">Asking Price:</span>
                <p className="price-value">{trade.price}</p>
              </div>

              <button className="mc-button trade-btn">Propose Trade</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}