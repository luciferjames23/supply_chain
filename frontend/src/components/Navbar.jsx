import React from 'react';
import { Database, Wifi, RefreshCw, Sparkles, Sun, Moon } from 'lucide-react';

export default function Navbar({ health, onRefresh, loading, theme = 'light', toggleTheme }) {
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
          className="theme-toggle-btn" 
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Normal Light Mode'}
        >
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>

        <button 
          className="refresh-btn" 
          onClick={onRefresh} 
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spinner' : ''} />
          Refresh
        </button>
      </div>
    </header>
  );
}
