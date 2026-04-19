import React, { useState, useEffect } from 'react';
import { adminLogin, adminApi } from '../api';
import { ShieldAlert, Plus, Trash2, Edit, Save, X } from 'lucide-react';

const AdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('products');
  const [data, setData] = useState({ products: [], supermarkets: [], prices: [] });

  // Add Product Form State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCat, setNewProdCat] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await adminLogin(username, password);
      setIsLoggedIn(true);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchData = async () => {
    try {
      const [prods, supers, prices] = await Promise.all([
        adminApi.get('products'),
        adminApi.get('supermarkets'),
        adminApi.get('prices')
      ]);
      setData({ products: prods, supermarkets: supers, prices: prices });
    } catch (err) {
      console.error(err);
    }
  };

  const submitNewProduct = async (e) => {
    e.preventDefault();
    if (!newProdName) return;
    await adminApi.post('products', { name: newProdName, category: newProdCat || 'General', description: '', image_url: '' });
    setNewProdName('');
    setNewProdCat('');
    setIsAddingProduct(false);
    fetchData();
  };

  const handleDeleteProduct = async (id) => {
    if(window.confirm('Delete product?')) {
        await adminApi.delete('products', id);
        fetchData();
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="container flex-center" style={{ height: '80vh' }}>
        <div className="glass-panel animate-in" style={{ padding: '40px', width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', color: 'var(--accent-danger)', marginBottom: '1rem' }}>
              <ShieldAlert size={32} />
            </div>
            <h2>Admin Access</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Restricted area</p>
          </div>

          {error && <div style={{ padding: '10px', background: 'var(--accent-danger-bg)', color: 'var(--accent-danger)', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label className="input-label">Username</label>
              <input type="text" value={username} onChange={e=>setUsername(e.target.value)} className="input-field" required />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="input-field" required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '12px' }}>Login to Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-in" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <h2>Admin Dashboard</h2>
        <button onClick={() => setIsLoggedIn(false)} className="btn btn-outline">Logout</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
        {['products', 'supermarkets', 'prices'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ 
              background: 'none', border: 'none', color: activeTab === tab ? 'white' : 'var(--text-muted)',
              fontSize: '1.1rem', fontWeight: '500', cursor: 'pointer', padding: '8px 16px',
              borderBottom: activeTab === tab ? '2px solid var(--primary-color)' : '2px solid transparent',
              transition: 'all 0.2s', textTransform: 'capitalize'
            }}
          >
            Manage {tab}
          </button>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        
        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div>
            <div className="flex-between" style={{ marginBottom: '20px' }}>
              <h3>Products Database</h3>
              <button onClick={() => setIsAddingProduct(!isAddingProduct)} className="btn btn-primary">
                {isAddingProduct ? <X size={18}/> : <Plus size={18}/>} 
                {isAddingProduct ? 'Cancel' : 'Add Product'}
              </button>
            </div>
            
            {isAddingProduct && (
              <form onSubmit={submitNewProduct} style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label className="input-label" style={{display:'block', marginBottom:'8px'}}>Product Name</label>
                  <input type="text" className="input-field" value={newProdName} onChange={e=>setNewProdName(e.target.value)} placeholder="e.g. Lipton Yellow Label" required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="input-label" style={{display:'block', marginBottom:'8px'}}>Category</label>
                  <input type="text" className="input-field" value={newProdCat} onChange={e=>setNewProdCat(e.target.value)} placeholder="e.g. Beverages" />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}><Save size={18}/> Save Data</button>
              </form>
            )}

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px' }}>ID</th>
                    <th style={{ padding: '12px' }}>Name</th>
                    <th style={{ padding: '12px' }}>Category</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.products.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px' }}>#{p.id}</td>
                      <td style={{ padding: '12px', fontWeight: '500' }}>{p.name}</td>
                      <td style={{ padding: '12px' }}><span className="badge" style={{background: 'rgba(255,255,255,0.1)'}}>{p.category}</span></td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button onClick={()=>handleDeleteProduct(p.id)} className="btn btn-danger" style={{ padding: '6px 12px' }}><Trash2 size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRICES TAB */}
        {activeTab === 'prices' && (
           <div>
            <div className="flex-between" style={{ marginBottom: '20px' }}>
              <h3>Pricing Data (Auto Updating via Node-Cron)</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px' }}>Product</th>
                    <th style={{ padding: '12px' }}>Supermarket</th>
                    <th style={{ padding: '12px' }}>Current Price</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.prices.map(pr => (
                    <tr key={pr.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px', fontWeight: '500' }}>{pr.product_name}</td>
                      <td style={{ padding: '12px' }}>{pr.supermarket_name}</td>
                      <td style={{ padding: '12px', color: 'var(--accent-success)', fontWeight:'bold' }}>Rs. {pr.current_price}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Auto-Synced
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUPERMARKETS MAP TAB (Simplified) */}
        {activeTab === 'supermarkets' && (
          <div>
            <h3>Active Supermarkets</h3>
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
              {data.supermarkets.map(s => (
                <div key={s.id} className="glass-panel" style={{ padding: '16px 24px', textAlign: 'center', minWidth: '150px' }}>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{s.name}</h4>
                  <span className="badge" style={{background: 'var(--accent-success-bg)', color: 'var(--accent-success)'}}>Active Online</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;
