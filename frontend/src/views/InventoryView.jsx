import React, { useState } from 'react';
import { Search, Package, ShieldAlert } from 'lucide-react';

export default function InventoryView({ predictions, features, onItemClick }) {
  const [subTab, setSubTab] = useState('predictions');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter predictions
  const filteredPredictions = predictions.filter((item) => {
    const matchesSearch = item.product_id?.toLowerCase().includes(search.toLowerCase()) ||
                          item.warehouse_id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.predicted_stock_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter features
  const filteredFeatures = features.filter((item) => {
    const matchesSearch = item.product_id?.toLowerCase().includes(search.toLowerCase()) ||
                          item.warehouse_id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.stock_status_prediction === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Sub nav */}
      <div className="sub-nav">
        <div className="sub-tabs">
          <button
            className={`sub-tab ${subTab === 'predictions' ? 'active' : ''}`}
            onClick={() => setSubTab('predictions')}
          >
            Inventory Predictions ({predictions.length})
          </button>
          <button
            className={`sub-tab ${subTab === 'features' ? 'active' : ''}`}
            onClick={() => setSubTab('features')}
          >
            Inventory ML Features ({features.length})
          </button>
        </div>

        <div className="filter-bar">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search product ID, warehouse..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Stock Statuses</option>
            <option value="STOCKOUT_RISK">Stockout Risk</option>
            <option value="CRITICAL">Critical</option>
            <option value="OVERSTOCK">Overstock</option>
            <option value="OPTIMAL">Optimal</option>
          </select>
        </div>
      </div>

      {/* Predictions Table */}
      {subTab === 'predictions' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Warehouse</th>
                <th>Predicted Status</th>
                <th>Severity</th>
                <th>Optimal Reorder Qty</th>
                <th>Recommended Safety Stock</th>
                <th>Next Reorder Date</th>
                <th>Cost Impact</th>
              </tr>
            </thead>
            <tbody>
              {filteredPredictions.map((item, idx) => (
                <tr key={idx} onClick={() => onItemClick(item, 'Inventory Prediction Detail')}>
                  <td><strong style={{ color: 'var(--accent-cyan)' }}>{item.product_id}</strong></td>
                  <td>{item.warehouse_id}</td>
                  <td>
                    <span className={`badge ${(item.predicted_stock_status || 'OPTIMAL').toLowerCase()}`}>
                      {item.predicted_stock_status || 'OPTIMAL'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${(item.problem_severity || 'LOW').toLowerCase()}`}>
                      {item.problem_severity || 'NONE'}
                    </span>
                  </td>
                  <td><strong>{item.optimal_reorder_qty ? item.optimal_reorder_qty.toLocaleString() : 0} units</strong></td>
                  <td>{item.optimal_safety_stock ? item.optimal_safety_stock.toLocaleString() : 0} units</td>
                  <td>{item.next_reorder_date || '—'}</td>
                  <td>${item.estimated_cost_impact ? item.estimated_cost_impact.toLocaleString() : '0'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Features Table */}
      {subTab === 'features' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Warehouse</th>
                <th>Total Demand</th>
                <th>Avg Stock Level</th>
                <th>Stockout Risk Score</th>
                <th>Stock Health Score</th>
                <th>Predicted Days to Stockout</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeatures.map((item, idx) => (
                <tr key={idx} onClick={() => onItemClick(item, 'Inventory ML Feature Detail')}>
                  <td><strong style={{ color: 'var(--accent-cyan)' }}>{item.product_id}</strong></td>
                  <td>{item.warehouse_id}</td>
                  <td>{item.total_demand ? item.total_demand.toLocaleString() : '—'}</td>
                  <td>{item.avg_stock_level ? item.avg_stock_level.toFixed(1) : '—'}</td>
                  <td>
                    {item.stockout_risk_score !== undefined ? (
                      <span style={{ color: item.stockout_risk_score > 0.6 ? 'var(--accent-rose)' : 'var(--accent-emerald)', fontWeight: 600 }}>
                        {(item.stockout_risk_score * 100).toFixed(0)}%
                      </span>
                    ) : '—'}
                  </td>
                  <td>{item.stock_health_score ? `${(item.stock_health_score * 100).toFixed(0)}%` : '—'}</td>
                  <td>
                    {item.predicted_days_to_stockout ? (
                      <strong style={{ color: item.predicted_days_to_stockout < 5 ? 'var(--accent-rose)' : 'inherit' }}>
                        {item.predicted_days_to_stockout} days
                      </strong>
                    ) : '—'}
                  </td>
                  <td>
                    <span className={`badge ${(item.stock_status_prediction || 'OPTIMAL').toLowerCase()}`}>
                      {item.stock_status_prediction || 'OPTIMAL'}
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
