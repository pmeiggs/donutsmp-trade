import React from 'react';

const TRADES = [
  { id: 1, item: "Enchanted Golden Apple", price: "250,000", seller: "Techno_Fan", rarity: "Legendary", type: "Food" },
  { id: 2, item: "Netherite Chestplate", price: "1.2M", seller: "Dreamy", rarity: "Epic", type: "Armor" },
  { id: 3, item: "Shulker Box (Blue)", price: "45,000", seller: "BoxMaster", rarity: "Rare", type: "Blocks" },
];

export default function Marketplace() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white drop-shadow-lg">AUCTION HOUSE</h2>
          <p className="text-blue-100 font-bold">Currently tracking {TRADES.length} active trades</p>
        </div>
        <div className="flex gap-2">
          <select className="mc-select"><option>Sort by Price</option></select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TRADES.map(trade => (
          <div key={trade.id} className="ah-card">
            <div className={`rarity-stripe ${trade.rarity.toLowerCase()}`} />
            <div className="p-6">
              <div className="flex justify-between mb-4">
                <span className="item-img-placeholder">📦</span>
                <span className={`tag-${trade.rarity.toLowerCase()}`}>{trade.rarity}</span>
              </div>
              <h3 className="text-white text-xl font-bold mb-1">{trade.item}</h3>
              <p className="text-white/50 text-sm mb-4">Seller: <span className="text-blue-300">@{trade.seller}</span></p>
              
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <div className="text-mc-emerald font-black text-xl">{trade.price} <span className="text-xs text-white/40">coins</span></div>
                <button className="btn-buy">Inspect BIN</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}