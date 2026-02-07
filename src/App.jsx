import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

// ---------------------------------------------------------
// 🚨 YOUR KEYS ARE SAVED HERE 🚨
// ---------------------------------------------------------
const supabaseUrl = 'https://krnakpqmaxznnsrohxrg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtybmFrcHFtYXh6bm5zcm9oeHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NzQ5MTMsImV4cCI6MjA4NjA1MDkxM30.77yKfEwqe8x_nJu0PWLzv0zcdczNyybFraI3e7dqxlc';
// ---------------------------------------------------------

const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  // --- STATE ---
  const [view, setView] = useState('market'); 
  const [user, setUser] = useState(null); 
  const [items, setItems] = useState([]); 
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [formData, setFormData] = useState({ name: '', price: '', image: '' });
  const chatBottomRef = useRef(null);

  // --- 1. FETCH MARKET ITEMS ---
  useEffect(() => {
    fetchAuctions();
    const itemSubscription = supabase
      .channel('public:auctions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'auctions' }, () => {
        fetchAuctions(); 
      })
      .subscribe();
    return () => { supabase.removeChannel(itemSubscription); };
  }, []);

  async function fetchAuctions() {
    const { data, error } = await supabase
      .from('auctions')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setItems(data);
  }

  // --- 2. FETCH CHAT ---
  useEffect(() => {
    if (!activeChat) return;

    // Load old messages
    async function getMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('auction_id', activeChat.id)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    }
    getMessages();

    // Listen for new messages
    const chatSubscription = supabase
      .channel(`chat:${activeChat.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `auction_id=eq.${activeChat.id}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new]); 
      })
      .subscribe();

    return () => { supabase.removeChannel(chatSubscription); };
  }, [activeChat]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- 3. ACTIONS ---
  const handleAddItem = async () => {
    if (!user) return alert("You must be logged in!");
    const { error } = await supabase.from('auctions').insert([{
        name: formData.name,
        price: formData.price,
        image: formData.image || "https://minecraft.wiki/images/Chest.png",
        seller: user.name,
        status: 'Active'
    }]);
    if (!error) { fetchAuctions(); setView('market'); }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    await supabase.from('messages').insert([{
      auction_id: activeChat.id,
      sender: user ? user.name : 'Anonymous',
      text: newMessage
    }]);
    setNewMessage("");
  };

  const handleCompleteTrade = async () => {
    await supabase.from('auctions').update({ status: 'Sold' }).eq('id', activeChat.id);
    alert(`Trade Confirmed!`);
    fetchAuctions();
    setView('market');
  };

  // --- 4. RENDER (Using direct JSX to fix focus bug) ---
  return (
    <div className="app-container">
      
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-brand" onClick={() => setView('market')}>
          DONUT<span style={{color: 'var(--mc-emerald)'}}>SMP</span>
        </div>
        <div className="nav-links">
          <button onClick={() => setView('market')}>Browse</button>
          {user ? (
            <button onClick={() => setView('profile')} style={{color: 'var(--mc-diamond)'}}>👤 {user.name}</button>
          ) : (
            <button onClick={() => setView('login')} className="btn-primary" style={{width: 'auto', padding: '5px 15px'}}>Login</button>
          )}
        </div>
      </nav>

      <main className="main-content">
        
        {/* VIEW: MARKET */}
        {view === 'market' && (
          <div className="market-grid">
            {items.map(item => (
              <div key={item.id} className="item-card" style={{opacity: item.status === 'Sold' ? 0.5 : 1}}>
                <div className="card-header"><img src={item.image} style={{height: '64px', objectFit: 'contain'}} /></div>
                <div className="card-body">
                  <h3>{item.name}</h3>
                  <p style={{color: '#888', fontSize: '0.9rem'}}>Seller: {item.seller}</p>
                  <span className="price-tag">${item.price}</span>
                  {item.status === 'Active' ? (
                    <button className="btn-primary" style={{marginTop: '15px'}} onClick={() => {
                        if(!user) setView('login');
                        else { setActiveChat(item); setView('chat'); }
                      }}>Buy Now</button>
                  ) : (
                    <button className="btn-primary" disabled style={{marginTop: '15px', background: '#444', borderColor: '#222', color: '#888'}}>SOLD</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW: LOGIN */}
        {view === 'login' && (
          <div className="login-overlay">
            <div className="login-box">
              <h2 style={{color: 'var(--mc-emerald)', marginBottom: '20px'}}>PLAYER LOGIN</h2>
              <input type="text" placeholder="Minecraft Username" className="input-field" onChange={(e) => setUser({name: e.target.value})} />
              <button className="btn-primary" onClick={() => { 
                 if(!user) setUser({name: 'Player1'}); 
                 setView('market'); 
              }}>Enter Server</button>
            </div>
          </div>
        )}

        {/* VIEW: PROFILE (SELL) */}
        {view === 'profile' && (
          <div style={{background: 'rgba(0,0,0,0.8)', padding: '2rem', borderRadius: '12px', maxWidth: '600px', margin: '0 auto'}}>
            <h2 style={{borderBottom: '2px solid #444', paddingBottom: '10px'}}>List an Item</h2>
            <div style={{marginTop: '20px'}}>
              <input className="input-field" placeholder="Item Name" onChange={e => setFormData({...formData, name: e.target.value})} />
              <input className="input-field" placeholder="Price" onChange={e => setFormData({...formData, price: e.target.value})} />
              <input className="input-field" placeholder="Image URL" onChange={e => setFormData({...formData, image: e.target.value})} />
              <button className="btn-primary" onClick={handleAddItem}>Post Auction</button>
            </div>
          </div>
        )}

        {/* VIEW: CHAT */}
        {view === 'chat' && activeChat && (
          <div className="chat-container" style={{maxWidth: '900px', margin: '0 auto', background: 'rgba(0,0,0,0.85)', padding: '20px', borderRadius: '12px', display: 'flex', gap: '20px', height: '500px'}}>
            {/* Left Panel */}
            <div style={{flex: 1, borderRight: '1px solid #444', paddingRight: '20px', display:'flex', flexDirection:'column'}}>
              <h2 style={{color: 'white'}}>Trade Room</h2>
              <div className="item-card">
                <div className="card-header"><img src={activeChat.image} style={{height:'64px'}} /></div>
                <div className="card-body"><h3>{activeChat.name}</h3><p className="price-tag">${activeChat.price}</p></div>
              </div>
              <div style={{marginTop:'auto'}}>
                <button className="btn-primary" style={{background: '#41cd70', marginBottom: '10px'}} onClick={handleCompleteTrade}>✅ Confirm Trade</button>
                <button style={{background: 'transparent', border: '1px solid #555', color: '#888', width: '100%', padding: '10px', cursor: 'pointer'}} onClick={() => setView('market')}>Exit Chat</button>
              </div>
            </div>

            {/* Right Panel (Chat) */}
            <div style={{flex: 2, display: 'flex', flexDirection: 'column'}}>
              <div style={{flex: 1, background: '#111', borderRadius: '8px', padding: '15px', overflowY: 'auto', marginBottom: '15px'}}>
                {messages.map((msg, index) => (
                  <div key={index} style={{
                    marginBottom: '10px', 
                    textAlign: msg.sender === user?.name ? 'right' : 'left'
                  }}>
                    <div style={{
                      display: 'inline-block',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: msg.sender === user?.name ? '#41cd70' : '#333',
                      color: msg.sender === user?.name ? '#000' : '#fff',
                      fontWeight: '500'
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              <div style={{display: 'flex', gap: '10px'}}>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  className="input-field" 
                  style={{marginBottom: 0}}
                  value={newMessage}
                  autoFocus
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="btn-primary" style={{width: '100px'}} onClick={handleSendMessage}>Send</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;