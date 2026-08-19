import React from 'react';
import { X, Cpu, Layers } from 'lucide-react';

export default function DetailModal({ item, title, onClose }) {
  if (!item) return null;

  const entries = Object.entries(item);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="logo-icon" style={{ width: 36, height: 36, borderRadius: 8 }}>
              <Cpu size={18} />
            </div>
            <div>
              <h2 className="modal-title">{title || 'ML Feature Record Detail'}</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Databricks SQL Gold Schema Feature
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
              <div className="field-label">{key.replace(/_/g, ' ')}</div>
              <div className="field-value">
                {val === null || val === undefined
                  ? '—'
                  : typeof val === 'boolean'
                  ? val ? 'TRUE' : 'FALSE'
                  : typeof val === 'number'
                  ? val.toLocaleString()
                  : String(val)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
