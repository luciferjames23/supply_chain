import React from 'react';
import { X, Box } from 'lucide-react';

export default function DetailModal({ item, title, onClose }) {
  if (!item) return null;

  const entries = Object.entries(item);

  const formatKeyLabel = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '—') return '—';
    try {
      const str = String(dateStr).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        const [year, month, day] = str.split('-').map(Number);
        const d = new Date(year, month - 1, day);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      const d = new Date(str);
      if (isNaN(d.getTime())) return str;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (err) {
      return String(dateStr);
    }
  };

  const formatVal = (key, val) => {
    if (val === null || val === undefined || val === '') return '—';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';

    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('date') || lowerKey.includes('created_at') || lowerKey.includes('timestamp')) {
      return formatDate(val);
    }
    if (
      lowerKey.includes('efficiency') ||
      lowerKey.includes('risk_score') ||
      lowerKey.includes('on_time_rate') ||
      lowerKey.includes('reliability_score') ||
      lowerKey.includes('confidence') ||
      lowerKey.includes('health_score')
    ) {
      if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)))) {
        const num = Number(val);
        let pct = num > 1 ? num : num * 100;
        pct = Math.min(100, Math.max(0, pct));
        return `${Math.round(pct)}%`;
      }
    }

    if (lowerKey.includes('value') || lowerKey.includes('cost') || lowerKey.includes('impact')) {
      if (typeof val === 'number') {
        return `$${Math.round(val).toLocaleString()}`;
      }
    }

    if (typeof val === 'number') {
      if (Number.isInteger(val)) return val.toLocaleString();
      const num = key.includes('days') ? Math.max(0, Math.abs(val)) : val;
      const formatted = num % 1 === 0 ? num : num.toFixed(1);
      return Number(formatted).toLocaleString();
    }
    return String(val);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="logo-icon" style={{ width: 36, height: 36, borderRadius: 8 }}>
              <Box size={18} />
            </div>
            <div>
              <h2 className="modal-title">{title || 'Record Details'}</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Supply Chain Record Overview
              </span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-section">
          {entries.map(([key, val]) => (
            <div className="modal-field" key={key}>
              <div className="field-label">{formatKeyLabel(key)}</div>
              <div className="field-value">{formatVal(key, val)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
