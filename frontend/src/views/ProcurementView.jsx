import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Pagination from '../components/Pagination';

export default function ProcurementView({ predictions = [], features = [], onItemClick }) {
  const [subTab, setSubTab] = useState('predictions');
  const [search, setSearch] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    setCurrentPage(1);
  }, [subTab, search]);

  const filteredPredictions = predictions.filter((item) => {
    return (
      item.carrier_id?.toLowerCase().includes(search.toLowerCase()) ||
      item.product_id?.toLowerCase().includes(search.toLowerCase()) ||
      item.warehouse_id?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const filteredFeatures = features.filter((item) => {
    return (
      item.carrier_id?.toLowerCase().includes(search.toLowerCase()) ||
      item.product_id?.toLowerCase().includes(search.toLowerCase()) ||
      item.warehouse_id?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const currentDataset = subTab === 'predictions' ? filteredPredictions : filteredFeatures;

  const getPaginatedData = (dataset) => {
    if (pageSize === 'ALL') return dataset;
    const start = (currentPage - 1) * pageSize;
    return dataset.slice(start, start + pageSize);
  };

  const formatDays = (val) => {
    if (val === null || val === undefined || isNaN(val)) return '—';
    const num = Math.max(0, Math.abs(Number(val)));
    const formatted = num % 1 === 0 ? num : num.toFixed(1);
    return `${formatted} days`;
  };

  return (
    <div>
      <div className="sub-nav">
        <div className="sub-tabs">
          <button
            className={`sub-tab ${subTab === 'predictions' ? 'active' : ''}`}
            onClick={() => setSubTab('predictions')}
          >
            Supplier Lead-Time Forecasts ({predictions.length.toLocaleString()})
          </button>
          <button
            className={`sub-tab ${subTab === 'features' ? 'active' : ''}`}
            onClick={() => setSubTab('features')}
          >
            Supplier Performance History ({features.length.toLocaleString()})
          </button>
        </div>

        <div className="filter-bar">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search supplier, product, warehouse..."
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
                <th>Carrier / Supplier</th>
                <th>Product ID</th>
                <th>Warehouse</th>
                <th>Predicted Delay Risk</th>
                <th>Estimated Lead Time</th>
                <th>Supplier Recommendation</th>
                <th>Cost Impact</th>
                <th>Action Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {getPaginatedData(filteredPredictions).map((item, idx) => (
                <tr key={idx} onClick={() => onItemClick(item, 'Supplier Risk Forecast')}>
                  <td><strong style={{ color: 'var(--accent-cyan)' }}>{item.carrier_id}</strong></td>
                  <td>{item.product_id}</td>
                  <td>{item.warehouse_id}</td>
                  <td>
                    <span className={`badge ${(item.risk_category || 'LOW_RISK').toLowerCase()}`}>
                      {(item.risk_category || 'LOW_RISK').replace('_', ' ')} ({item.predicted_delay_risk ? Math.min(100, Math.round(item.predicted_delay_risk > 1 ? item.predicted_delay_risk : item.predicted_delay_risk * 100)) : 10}%)
                    </span>
                  </td>
                  <td>{formatDays(item.predicted_fulfillment_days)}</td>
                  <td>
                    {item.alternative_supplier_recommended ? (
                      <span className="badge high">RECOMMENDED SWITCH</span>
                    ) : (
                      <span className="badge success">MAINTAIN PRIMARY</span>
                    )}
                  </td>
                  <td>${item.procurement_cost_impact ? Math.round(item.procurement_cost_impact).toLocaleString() : '0'}</td>
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
                <th>On-Time Delivery Rate</th>
                <th>Reliability Score</th>
                <th>Risk Category</th>
              </tr>
            </thead>
            <tbody>
              {getPaginatedData(filteredFeatures).map((item, idx) => (
                <tr key={idx} onClick={() => onItemClick(item, 'Supplier Performance Record')}>
                  <td><strong style={{ color: 'var(--accent-cyan)' }}>{item.carrier_name || item.carrier_id}</strong></td>
                  <td>{item.product_id}</td>
                  <td>{item.warehouse_id}</td>
                  <td>{item.total_quantity_ordered ? item.total_quantity_ordered.toLocaleString() : '—'}</td>
                  <td>{formatDays(item.avg_fulfillment_days)}</td>
                  <td>{item.on_time_rate ? `${(item.on_time_rate * 100).toFixed(0)}%` : '—'}</td>
                  <td>{item.supplier_reliability_score ? `${(item.supplier_reliability_score * 100).toFixed(0)}%` : '—'}</td>
                  <td>
                    <span className={`badge ${(item.supplier_risk_category || 'LOW_RISK').toLowerCase()}`}>
                      {(item.supplier_risk_category || 'LOW_RISK').replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalItems={currentDataset.length}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
