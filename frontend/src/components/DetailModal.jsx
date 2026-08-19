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

  const formatVal = (key, val) => {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
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
