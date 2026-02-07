const Dashboard = ({ items, user, setView, setActiveChat }) => {
  const myListings = items.filter(item => item.seller === user?.name);
  
  return (
    <div className="dashboard-container" style={{color: 'white', maxWidth: '1000px', margin: '0 auto'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
        <h1>{user?.name}'s Command Center</h1>
        <button className="btn-primary" onClick={() => setView('profile')} style={{width: 'auto', padding: '10px 20px'}}>
          + List New Item
        </button>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px'}}>
        
        {/* LISTINGS STATUS */}
        <section className="dashboard-card" style={{background: 'rgba(0,0,0,0.6)', padding: '20px', borderRadius: '12px', border: '1px solid #333'}}>
          <h2 style={{color: '#41cd70', borderBottom: '1px solid #333', paddingBottom: '10px'}}>Active Listings</h2>
          <div style={{marginTop: '15px'}}>
            {myListings.map(item => (
              <div key={item.id} style={{display: 'flex', justifyContent: 'space-between', background: '#222', padding: '10px', borderRadius: '8px', marginBottom: '10px'}}>
                <span>{item.name}</span>
                <span style={{color: item.status === 'Active' ? '#41cd70' : '#ff5555'}}>{item.status}</span>
              </div>
            ))}
          </div>
        </section>

        {/* INBOX / MESSAGES */}
        <section className="dashboard-card" style={{background: 'rgba(0,0,0,0.6)', padding: '20px', borderRadius: '12px', border: '1px solid #333'}}>
          <h2 style={{color: '#55ffff', borderBottom: '1px solid #333', paddingBottom: '10px'}}>Inbox</h2>
          <div style={{marginTop: '15px'}}>
            <p style={{fontSize: '0.8rem', color: '#888'}}>Recent inquiries on your items:</p>
            {/* Logic to show items people are talking to you about */}
            {myListings.slice(0, 3).map(item => (
              <div 
                key={item.id} 
                className="inbox-item"
                onClick={() => { setActiveChat(item); setView('chat'); }}
                style={{cursor: 'pointer', background: '#333', padding: '10px', borderRadius: '8px', marginTop: '10px'}}
              >
                <strong>{item.name}</strong>
                <div style={{fontSize: '0.7rem'}}>Click to view trade chat</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};