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

        <footer style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '3rem 0 1rem 0',
          background: 'rgba(255,255,255,0.02)',
          marginTop: 'auto'
        }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', color: 'var(--text-muted)' }}>
            <div>
              <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>SuperCompare MVP</h3>
              <p style={{ fontSize: '0.9rem', maxWidth: '300px', lineHeight: '1.5' }}>Pakistan's centralized platform helping consumers find the best deals and lowest prices daily across all major supermarkets.</p>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '1rem' }}>Contact Info</h4>
              <p style={{ fontSize: '0.9rem', margin: '6px 0' }}>Email: support@supercompare.pk</p>
              <p style={{ fontSize: '0.9rem', margin: '6px 0' }}>Phone: +92 300 1234567</p>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '1rem' }}>Head Office</h4>
              <p style={{ fontSize: '0.9rem', margin: '6px 0' }}>Plot 12-C, Ittihad Commercial</p>
              <p style={{ fontSize: '0.9rem', margin: '6px 0' }}>Phase 6, DHA, Karachi</p>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.8rem' }}>
            &copy; {new Date().getFullYear()} SuperCompare Platform. All rights reserved.
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
