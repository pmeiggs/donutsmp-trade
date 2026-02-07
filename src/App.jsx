import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import './components/Header/header.css'; 
import './App.css';

// ---------------------------------------------------------
// keys for db
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
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  
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

    async function getMessages() {
      const { data } = await supabase.from('messages').select('*').eq('auction_id', activeChat.id).order('created_at', { ascending: true });
      if (data) setMessages(data);
    }
    getMessages();

    const chatSubscription = supabase
      .channel(`chat:${activeChat.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `auction_id=eq.${activeChat.id}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new]); 
      })
      .subscribe();

    return () => { supabase.removeChannel(chatSubscription); };
  }, [activeChat]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- 3. ACTIONS ---
  const handleLoginSubmit = () => {
    if (!loginForm.username || !loginForm.password) {
      alert("Please enter both Username and Password!");
      return;
    }
    setUser({ name: loginForm.username });
    setView('market');
  };

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
    alert(`Trade Confirmed! Item marked as SOLD.`);
    fetchAuctions();
    setView('market');
  };

  // --- 4. NAVBAR ---
  const Navbar = () => (
    <nav className="header">
      <div className="logo" onClick={() => setView('market')}>
        <img src="/logo.png" style={{height:'40px', marginRight:'10px', verticalAlign:'middle'}} />
        DONUT<span style={{color: '#41cd70'}}>SMP</span>
      </div>

      <div style={{flex: 1, maxWidth: '500px', margin: '0 20px'}}>
        <input type="text" className="search-input" placeholder="Search items..." style={{width: '100%'}} />
      </div>

      <div className="nav">
        <a onClick={() => setView('market')} className={view === 'market' ? 'active' : ''}>Market</a>
        <a onClick={() => alert("Coming Soon!")}>Auctions</a>
        
        {user ? (
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <button className="btn-user-profile" onClick={() => setView('profile')}>
              <div className="avatar-circle">{user.name.charAt(0).toUpperCase()}</div>
              <span style={{fontWeight:'600'}}>{user.name}</span>
            </button>
            <button className="signout" onClick={() => { setUser(null); setView('market'); }}>Sign Out</button>
          </div>
        ) : (
          <button className="signin" onClick={() => setView('login')}>Sign In / Sign Up</button>
        )}
      </div>
    </nav>
  );

  // --- 5. MAIN RENDER ---
  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        
        {/* VIEW: MARKET (Includes Self-Trade Block) */}
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
                    user?.name === item.seller ? (
                      <button className="btn-primary" disabled style={{marginTop: '15px', background: '#555', cursor: 'not-allowed', borderColor: '#444'}}>
                        Your Listing
                      </button>
                    ) : (
                      <button className="btn-primary" style={{marginTop: '15px'}} onClick={() => {
                          if(!user) setView('login');
                          else { setActiveChat(item); setView('chat'); }
                        }}>Buy Now</button>
                    )
                  ) : <button className="btn-primary" disabled style={{marginTop: '15px', background: '#333', borderColor: '#222', color: '#888'}}>SOLD</button>}
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
              <input type="text" placeholder="Minecraft Username" className="input-field" onChange={(e) => setLoginForm({...loginForm, username: e.target.value})} />
              <input type="password" placeholder="Password" className="input-field" onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} />
              <button className="btn-primary" onClick={handleLoginSubmit}>Enter Server</button>
            </div>
          </div>
        )}

        {/* VIEW: PROFILE */}
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

            <div style={{flex: 2, display: 'flex', flexDirection: 'column'}}>
              <div style={{flex: 1, background: '#111', borderRadius: '8px', padding: '15px', overflowY: 'auto', marginBottom: '15px'}}>
                {messages.map((msg, index) => (
                  <div key={index} style={{textAlign: msg.sender === user?.name ? 'right' : 'left', marginBottom: '10px'}}>
                    <span style={{background: msg.sender === user?.name ? '#41cd70' : '#333', color: msg.sender === user?.name ? '#000' : '#fff', padding:'8px 12px', borderRadius:'8px', display:'inline-block'}}>
                      {msg.text}
                    </span>
                    <div style={{fontSize: '0.7rem', color: '#555', marginTop: '2px'}}>{msg.sender}</div>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>
              <div style={{display: 'flex', gap: '10px'}}>
                <input className="input-field" placeholder="Type a message..." style={{marginBottom: 0}} value={newMessage} autoFocus onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                <button className="btn-primary" onClick={handleSendMessage} style={{width:'100px'}}>Send</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;