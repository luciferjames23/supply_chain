import React from 'react';
import { Database, Wifi, RefreshCw, Sparkles } from 'lucide-react';

export default function Navbar({ health, onRefresh, loading }) {
  const isOnline = health && health.status === 'ok';

  return (
    <header className="top-header">
      <div className="brand-logo">
        <div className="logo-icon">
          <Sparkles size={22} />
        </div>
        <div>
          <h1 className="brand-text">Supply Chain Control Tower</h1>
        </div>
      </div>

      <div className="header-status">
        <div className="catalog-pill">
          <Database size={13} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Live Network Data
        </div>

        <div className={`status-badge ${isOnline ? '' : 'offline'}`}>
          <span className="dot"></span>
          <Wifi size={14} />
          {isOnline ? 'System Online' : 'Offline Mode'}
        </div>

        <button 
          className="sub-tab" 
          onClick={onRefresh} 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <RefreshCw size={14} className={loading ? 'spinner' : ''} />
          Refresh
        </button>
      </div>
    </header>
  );
}
