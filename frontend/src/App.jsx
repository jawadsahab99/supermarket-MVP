import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ShoppingBasket, ShieldCheck } from 'lucide-react';
import CustomerView from './pages/CustomerView';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <header className="nav-header">
          <div className="container flex-between">
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'var(--primary-gradient)', padding: '8px', borderRadius: '12px' }}>
                <ShoppingBasket color="white" size={24} />
              </div>
              <h2 className="gradient-text" style={{ margin: 0 }}>SuperCompare</h2>
            </Link>
            
            <nav style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/admin" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                <ShieldCheck size={16} /> Admin
              </Link>
            </nav>
          </div>
        </header>

        <main style={{ minHeight: 'calc(100vh - 80px)' }}>
          <Routes>
            <Route path="/" element={<CustomerView />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
