import React, { useState } from 'react';
import { Search, ShoppingCart, UserCheck, AlertTriangle } from 'lucide-react';

export default function ProcurementView({ predictions, features, onItemClick }) {
  const [subTab, setSubTab] = useState('predictions');
  const [search, setSearch] = useState('');

  const filteredPredictions = predictions.filter((item) => {
    return item.carrier_id?.toLowerCase().includes(search.toLowerCase()) ||
           item.product_id?.toLowerCase().includes(search.toLowerCase()) ||
           item.warehouse_id?.toLowerCase().includes(search.toLowerCase());
  });

  const filteredFeatures = features.filter((item) => {
    return item.carrier_id?.toLowerCase().includes(search.toLowerCase()) ||
           item.product_id?.toLowerCase().includes(search.toLowerCase()) ||
           item.warehouse_id?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <div className="sub-nav">
        <div className="sub-tabs">
          <button
            className={`sub-tab ${subTab === 'predictions' ? 'active' : ''}`}
            onClick={() => setSubTab('predictions')}
          >
            Procurement Predictions ({predictions.length})
          </button>
          <button
            className={`sub-tab ${subTab === 'features' ? 'active' : ''}`}
            onClick={() => setSubTab('features')}
          >
            Procurement ML Features ({features.length})
          </button>
        </div>

        <div className="filter-bar">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search carrier, product, warehouse..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {subTab === 'predictions' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Carrier ID</th>
                <th>Product ID</th>
                <th>Warehouse</th>
                <th>Predicted Delay Risk</th>
                <th>Predicted Fulfillment</th>
                <th>Alternative Supplier Switch?</th>
                <th>Cost Impact</th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {filteredPredictions.map((item, idx) => (
                <tr key={idx} onClick={() => onItemClick(item, 'Procurement Prediction Detail')}>
                  <td><strong style={{ color: 'var(--accent-cyan)' }}>{item.carrier_id}</strong></td>
                  <td>{item.product_id}</td>
                  <td>{item.warehouse_id}</td>
                  <td>
                    <span className={`badge ${(item.risk_category || 'LOW_RISK').toLowerCase()}`}>
                      {item.risk_category || 'LOW_RISK'} ({(item.predicted_delay_risk ? (item.predicted_delay_risk * 100).toFixed(0) : 10)}%)
                    </span>
                  </td>
                  <td>{item.predicted_fulfillment_days ? `${item.predicted_fulfillment_days} days` : '—'}</td>
                  <td>
                    {item.alternative_supplier_recommended ? (
                      <span className="badge high">RECOMMENDED SWITCH</span>
                    ) : (
                      <span className="badge success">MAINTAIN PRIMARY</span>
                    )}
                  </td>
                  <td>${item.procurement_cost_impact ? item.procurement_cost_impact.toLocaleString() : '0'}</td>
                  <td><span className="badge info">{item.recommendation || 'Standard Order'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'features' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Carrier / Supplier</th>
                <th>Product ID</th>
                <th>Warehouse</th>
                <th>Total Ordered Qty</th>
                <th>Avg Fulfillment Days</th>
                <th>On-Time Rate</th>
                <th>Reliability Score</th>
                <th>Risk Category</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeatures.map((item, idx) => (
                <tr key={idx} onClick={() => onItemClick(item, 'Procurement ML Feature Detail')}>
                  <td><strong style={{ color: 'var(--accent-cyan)' }}>{item.carrier_name || item.carrier_id}</strong></td>
                  <td>{item.product_id}</td>
                  <td>{item.warehouse_id}</td>
                  <td>{item.total_quantity_ordered ? item.total_quantity_ordered.toLocaleString() : '—'}</td>
                  <td>{item.avg_fulfillment_days ? `${item.avg_fulfillment_days.toFixed(1)} days` : '—'}</td>
                  <td>{item.on_time_rate ? `${(item.on_time_rate * 100).toFixed(0)}%` : '—'}</td>
                  <td>{item.supplier_reliability_score ? `${(item.supplier_reliability_score * 100).toFixed(0)}%` : '—'}</td>
                  <td>
                    <span className={`badge ${(item.supplier_risk_category || 'LOW_RISK').toLowerCase()}`}>
                      {item.supplier_risk_category || 'LOW_RISK'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
