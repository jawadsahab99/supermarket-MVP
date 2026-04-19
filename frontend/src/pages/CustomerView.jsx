import React, { useState, useEffect } from 'react';
import { Search, Info, TrendingDown, Tag, ShoppingBasket } from 'lucide-react';
import { searchProducts } from '../api';

const CustomerView = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch and auto-poll data on mount
  useEffect(() => {
    handleSearch('');
    
    // Auto-refresh prices seamlessly every 30 seconds to catch simulated live scraper updates!
    const interval = setInterval(() => {
      setHasSearched(false); // Don't show loading spinner for background refetches
      handleSearch(query);
    }, 30000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array ensures interval sits on mount

  const handleSearch = async (searchQuery = query) => {
    setLoading(true);
    const data = await searchProducts(searchQuery);
    setResults(data);
    setLoading(false);
    setHasSearched(true);
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginTop: '4rem', marginBottom: '3rem' }} className="animate-in">
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
          Find the <span className="gradient-text">Best Deals</span> Every Time.
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Compare prices and promotions across top supermarkets instantly and never overpay for your groceries again.
        </p>

        <form onSubmit={onSearchSubmit} style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search for Milk, Eggs, Bread..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: '48px', height: '56px', fontSize: '1.1rem', borderRadius: '99px' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '56px', padding: '0 32px', fontSize: '1.1rem' }}>
            Search
          </button>
        </form>
      </div>

      {/* Results Section */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <div className="animate-in" style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid var(--border-light)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ marginTop: '1rem' }}>Searching supermarkets...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {results.length > 0 ? results.map((product, index) => (
            <div key={product.id} className="glass-panel animate-in" style={{ animationDelay: `${index * 0.1}s`, padding: '24px' }}>
              <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{product.name}</h3>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>{product.category}</span>
                  </div>
                  {/* Placeholder for Product Image */}
                  <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingBasket size={24} color="var(--text-muted)" />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price Comparison</h4>
                
                {product.prices.sort((a,b) => a.price - b.price).map((store, i) => (
                  <div key={i} style={{ 
                    padding: '16px', 
                    borderRadius: '12px', 
                    background: store.is_best_value ? 'rgba(245, 158, 11, 0.05)' : 'rgba(0,0,0,0.2)',
                    border: store.is_best_value ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
                    position: 'relative'
                  }}>
                    
                    {store.is_best_value && (
                      <div style={{ position: 'absolute', top: '-10px', right: '16px' }}>
                        <span className="badge badge-best"><TrendingDown size={14} style={{marginRight: '4px'}}/> Best Value</span>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{store.supermarket_name}</span>
                      <span style={{ 
                        fontSize: '1.3rem', 
                        fontWeight: '700', 
                        color: store.is_lowest ? 'var(--accent-success)' : 'inherit' 
                      }}>
                        Rs. {store.price.toFixed(2)}
                      </span>
                    </div>

                    {store.is_lowest && !store.is_best_value && (
                      <div style={{ marginTop: '8px' }}>
                        <span className="badge badge-lowest">Lowest Price</span>
                      </div>
                    )}

                    {store.promotion && (
                      <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', borderLeft: '3px solid var(--secondary-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--secondary-color)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '2px' }}>
                          <Tag size={14} /> {store.promotion.title}
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                          {store.promotion.description}
                        </p>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            </div>
          )) : (
            hasSearched && !loading && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'var(--bg-card)', borderRadius: '16px' }}>
                <Info size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.5rem' }}>No products found</h3>
                <p style={{ color: 'var(--text-muted)' }}>Try searching for a different item.</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerView;
