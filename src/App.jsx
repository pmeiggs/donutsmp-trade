import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import './components/Header/header.css'; 
import './App.css';

const supabaseUrl = 'https://krnakpqmaxznnsrohxrg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtybmFrcHFtYXh6bm5zcm9oeHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NzQ5MTMsImV4cCI6MjA4NjA1MDkxM30.77yKfEwqe8x_nJu0PWLzv0zcdczNyybFraI3e7dqxlc';

const supabase = createClient(supabaseUrl, supabaseKey);

// --- 📊 DASHBOARD COMPONENT ---
const Dashboard = ({ items, user, setView, setActiveChat }) => {
  const myListings = items.filter(item => item.seller === user?.name);
  
  return (
    <div className="dashboard-container" style={{color: 'white', maxWidth: '1000px', margin: '0 auto', padding: '20px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
        <h1>{user?.name}'s Command Center</h1>
        <button className="signin" onClick={() => setView('profile')}>+ List New Item</button>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px'}}>
        <section style={{background: 'rgba(0,0,0,0.6)', padding: '20px', borderRadius: '12px', border: '1px solid #333'}}>
          <h2 style={{color: '#41cd70', borderBottom: '1px solid #433', paddingBottom: '10px'}}>My Listings</h2>
          <div style={{marginTop: '15px'}}>
            {myListings.length === 0 ? <p style={{color: '#666'}}>No listings yet.</p> : 
              myListings.map(item => (
                <div key={item.id} style={{display: 'flex', justifyContent: 'space-between', background: '#222', padding: '12px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #444'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <img src={item.image} style={{width:'24px'}} alt="" />
                    <span>{item.name}</span>
                  </div>
                  <span style={{color: item.status === 'Active' ? '#41cd70' : '#ff5555', fontWeight:'bold'}}>{item.status}</span>
                </div>
              ))
            }
          </div>
        </section>

        <section style={{background: 'rgba(0,0,0,0.6)', padding: '20px', borderRadius: '12px', border: '1px solid #333'}}>
          <h2 style={{color: '#55ffff', borderBottom: '1px solid #334', paddingBottom: '10px'}}>Active Inquiries</h2>
          <div style={{marginTop: '15px'}}>
            {myListings.filter(i => i.status === 'Active').map(item => (
              <div 
                key={item.id} 
                onClick={() => { setActiveChat(item); setView('chat'); }}
                style={{cursor: 'pointer', background: '#333', padding: '12px', borderRadius: '8px', marginBottom: '10px', borderLeft: '4px solid #55ffff'}}
              >
                <div style={{fontWeight: 'bold'}}>{item.name}</div>
                <div style={{fontSize: '0.8rem', color: '#888'}}>Click to open trade chat</div>
              </div>
            ))}
            {myListings.filter(i => i.status === 'Active').length === 0 && <p style={{color:'#666'}}>No active trade chats.</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

function App() {
  const [view, setView] = useState('market'); 
  const [user, setUser] = useState(null); 
  const [items, setItems] = useState([]); 
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [formData, setFormData] = useState({ name: '', price: '', image: '' });
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const chatBottomRef = useRef(null);

  useEffect(() => {
    fetchAuctions();
    const sub = supabase.channel('public:auctions').on('postgres_changes', { event: '*', schema: 'public', table: 'auctions' }, fetchAuctions).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  async function fetchAuctions() {
    const { data, error } = await supabase.from('auctions').select('*').order('created_at', { ascending: false });
    if (!error) setItems(data);
  }

  // --- 2. FETCH CHAT (WITH FIX) ---
  useEffect(() => {
    if (!activeChat) return;

    // RESET MESSAGES so switching players doesn't show old text
    setMessages([]);

    async function getMessages() {
      const { data } = await supabase.from('messages').select('*').eq('auction_id', activeChat.id).order('created_at', { ascending: true });
      if (data) setMessages(data);
    }
    getMessages();

    const chatSub = supabase.channel(`chat:${activeChat.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `auction_id=eq.${activeChat.id}` }, (p) => {
        setMessages((prev) => [...prev, p.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(chatSub); };
  }, [activeChat]);

  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleLoginSubmit = () => {
    if (!loginForm.username || !loginForm.password) return alert("Enter credentials!");
    setUser({ name: loginForm.username });
    setView('market');
  };

  const handleAddItem = async () => {
    const { error } = await supabase.from('auctions').insert([{ ...formData, seller: user.name, status: 'Active' }]);
    if (!error) { fetchAuctions(); setView('dashboard'); }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    // BLOCK SELLERS FROM MESSAGING THEMSELVES
    if (user.name === activeChat.seller) {
      alert("You cannot message your own listing!");
      return;
    }
    await supabase.from('messages').insert([{ auction_id: activeChat.id, sender: user.name, text: newMessage }]);
    setNewMessage("");
  };

  const handleCompleteTrade = async () => {
    await supabase.from('auctions').update({ status: 'Sold' }).eq('id', activeChat.id);
    alert(`Trade Confirmed!`);
    fetchAuctions();
    setView('dashboard');
  };

  const Navbar = () => (
    <nav className="header">
      <div className="logo" onClick={() => setView('market')}>
        <img src="/logo.png" style={{height:'40px', marginRight:'10px', verticalAlign:'middle'}} alt="" />
        DONUT<span style={{color: '#41cd70'}}>SMP</span>
      </div>
      <div style={{flex: 1, maxWidth: '500px', margin: '0 20px'}}>
        <input type="text" className="search-input" placeholder="Search items..." style={{width: '100%'}} />
      </div>
      <div className="nav">
        <a onClick={() => setView('market')} className={view === 'market' ? 'active' : ''}>Market</a>
        {user ? (
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <button className="btn-user-profile" onClick={() => setView('dashboard')}>
              <div className="avatar-circle">{user.name.charAt(0).toUpperCase()}</div>
              <span style={{fontWeight:'600'}}>{user.name}</span>
            </button>
            <button className="signout" onClick={() => { setUser(null); setView('market'); }}>Sign Out</button>
          </div>
        ) : (
          <button className="signin" onClick={() => setView('login')}>Sign In</button>
        )}
      </div>
    </nav>
  );

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        {view === 'market' && (
          <div className="market-grid">
            {items.map(item => (
              <div key={item.id} className="item-card" style={{opacity: item.status === 'Sold' ? 0.5 : 1}}>
                <div className="card-header"><img src={item.image} style={{height: '64px'}} alt="" /></div>
                <div className="card-body">
                  <h3>{item.name}</h3>
                  <p style={{color: '#888'}}>Seller: {item.seller}</p>
                  <span className="price-tag">${item.price}</span>
                  {item.status === 'Active' ? (
                    user?.name === item.seller ? (
                      <button className="btn-primary" disabled style={{marginTop: '15px', background: '#555'}}>Your Listing</button>
                    ) : (
                      <button className="btn-primary" style={{marginTop: '15px'}} onClick={() => { if(!user) setView('login'); else { setActiveChat(item); setView('chat'); } }}>Buy Now</button>
                    )
                  ) : <button className="btn-primary" disabled style={{marginTop: '15px', background: '#333'}}>SOLD</button>}
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'dashboard' && <Dashboard items={items} user={user} setView={setView} setActiveChat={setActiveChat} />}

        {view === 'login' && (
          <div className="login-overlay">
            <div className="login-box">
              <h2>PLAYER LOGIN</h2>
              <input type="text" placeholder="Username" className="input-field" onChange={(e) => setLoginForm({...loginForm, username: e.target.value})} />
              <input type="password" placeholder="Password" className="input-field" onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} />
              <button className="btn-primary" onClick={handleLoginSubmit}>Enter Server</button>
            </div>
          </div>
        )}

        {view === 'profile' && (
          <div style={{background: 'rgba(0,0,0,0.8)', padding: '2rem', borderRadius: '12px', maxWidth: '600px', margin: '0 auto'}}>
            <h2>List an Item</h2>
            <input className="input-field" placeholder="Item Name" onChange={e => setFormData({...formData, name: e.target.value})} />
            <input className="input-field" placeholder="Price" onChange={e => setFormData({...formData, price: e.target.value})} />
            <input className="input-field" placeholder="Image URL" onChange={e => setFormData({...formData, image: e.target.value})} />
            <button className="btn-primary" onClick={handleAddItem}>Post Auction</button>
            <button onClick={() => setView('dashboard')} style={{background:'none', border:'none', color:'#888', marginTop:'10px', cursor:'pointer'}}>Back to Dashboard</button>
          </div>
        )}

        {view === 'chat' && activeChat && (
          <div className="chat-container" style={{maxWidth: '900px', margin: '0 auto', background: 'rgba(0,0,0,0.85)', padding: '20px', borderRadius: '12px', display: 'flex', gap: '20px', height: '500px'}}>
            <div style={{flex: 1, borderRight: '1px solid #444', paddingRight: '20px', display:'flex', flexDirection:'column'}}>
              <h2>Trade Room</h2>
              <div className="item-card">
                <div className="card-body"><h3>{activeChat.name}</h3><p className="price-tag">${activeChat.price}</p></div>
              </div>
              <div style={{marginTop:'auto'}}>
                {user?.name === activeChat.seller && (
                  <button className="btn-primary" style={{background: '#41cd70', marginBottom: '10px'}} onClick={handleCompleteTrade}>✅ Confirm Trade</button>
                )}
                <button style={{background: 'transparent', border: '1px solid #555', color: '#888', width: '100%', padding: '10px', cursor: 'pointer'}} onClick={() => setView('market')}>Exit</button>
              </div>
            </div>

            <div style={{flex: 2, display: 'flex', flexDirection: 'column'}}>
              {user?.name === activeChat.seller ? (
                <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: '#111', borderRadius: '8px', padding: '20px'}}>
                  <div style={{fontSize: '3rem', marginBottom: '20px'}}>📩</div>
                  <h3 style={{color: '#41cd70'}}>Your Active Listing</h3>
                  <p style={{color: '#888'}}>Awaiting buyer inquiries. Messages will appear below.</p>
                  <div style={{width:'100%', marginTop:'20px', overflowY:'auto', background:'#000', borderRadius:'8px', padding:'10px'}}>
                     {messages.length === 0 ? <p style={{fontSize:'0.8rem', color:'#444'}}>No messages yet...</p> : 
                      messages.map((m, i) => (
                        <div key={i} style={{textAlign:'left', marginBottom:'10px'}}>
                           <span style={{background:'#333', padding:'5px 10px', borderRadius:'5px', fontSize:'0.9rem'}}>{m.text}</span>
                        </div>
                      ))
                     }
                  </div>
                </div>
              ) : (
                <>
                  <div style={{padding: '10px 15px', background: '#222', borderRadius: '8px 8px 0 0', borderBottom: '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <div className="avatar-circle" style={{width: '24px', height: '24px', fontSize: '0.7rem'}}>
                        {activeChat.seller.charAt(0).toUpperCase()}
                      </div>
                      <span style={{color: '#41cd70', fontWeight: 'bold'}}>Chat with {activeChat.seller}</span>
                    </div>
                  </div>

                  <div style={{flex: 1, background: '#111', padding: '15px', overflowY: 'auto', marginBottom: '15px', borderRadius: '0 0 8px 8px'}}>
                    {messages.map((msg, index) => (
                      <div key={index} style={{textAlign: msg.sender === user?.name ? 'right' : 'left', marginBottom: '15px'}}>
                        <div style={{fontSize: '0.65rem', color: '#666', marginBottom: '2px', textTransform: 'uppercase'}}>
                          {msg.sender === user?.name ? 'You' : msg.sender}
                        </div>
                        <span style={{background: msg.sender === user?.name ? '#41cd70' : '#333', color: msg.sender === user?.name ? '#000' : '#fff', padding:'8px 12px', borderRadius:'8px', display:'inline-block', fontWeight:'500'}}>
                          {msg.text}
                        </span>
                      </div>
                    ))}
                    <div ref={chatBottomRef} />
                  </div>
                  <div style={{display: 'flex', gap: '10px'}}>
                    <input className="input-field" placeholder={`Message ${activeChat.seller}...`} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                    <button className="btn-primary" onClick={handleSendMessage} style={{width:'100px'}}>Send</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;