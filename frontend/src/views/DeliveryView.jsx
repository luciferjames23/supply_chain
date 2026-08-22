import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Pagination from '../components/Pagination';

export default function DeliveryView({ predictions = [], features = [], onItemClick }) {
  const [subTab, setSubTab] = useState('predictions');
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Reset to page 1 whenever tab, search, or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [subTab, search, riskFilter]);

  const filteredPredictions = predictions.filter((item) => {
    const matchesSearch =
      item.shipment_id?.toLowerCase().includes(search.toLowerCase()) ||
      item.carrier_id?.toLowerCase().includes(search.toLowerCase()) ||
      item.origin?.toLowerCase().includes(search.toLowerCase()) ||
      item.destination?.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || item.delay_risk === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const filteredFeatures = features.filter((item) => {
    const matchesSearch =
      item.shipment_id?.toLowerCase().includes(search.toLowerCase()) ||
      item.carrier_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.origin?.toLowerCase().includes(search.toLowerCase()) ||
      item.destination?.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || item.risk_level === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const currentDataset = subTab === 'predictions' ? filteredPredictions : filteredFeatures;

  // Paginated slice
  const getPaginatedData = (dataset) => {
    if (pageSize === 'ALL') return dataset;
    const start = (currentPage - 1) * pageSize;
    return dataset.slice(start, start + pageSize);
  };

  const formatShortNum = (num, suffix = '') => {
    if (num === null || num === undefined || isNaN(num)) return '—';
    const n = Math.max(0, Number(num));
    const formatted = n % 1 === 0 ? n : n.toFixed(1);
    return `${formatted}${suffix}`;
  };

  return (
    <div>
      {/* Sub navigation & Search bar */}
      <div className="sub-nav">
        <div className="sub-tabs">
          <button
            className={`sub-tab ${subTab === 'predictions' ? 'active' : ''}`}
            onClick={() => setSubTab('predictions')}
          >
            Delivery Risk Forecasts ({predictions.length.toLocaleString()})
          </button>
          <button
            className={`sub-tab ${subTab === 'features' ? 'active' : ''}`}
            onClick={() => setSubTab('features')}
          >
            Route & Transit Metrics ({features.length.toLocaleString()})
          </button>
        </div>

        <div className="filter-bar">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search shipment, carrier, route..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="ALL">All Risk Levels</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Predictions Table */}
      {subTab === 'predictions' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Shipment ID</th>
                <th>Carrier</th>
                <th>Origin &rarr; Destination</th>
                <th>Estimated Transit Time</th>
                <th>Predicted Delay</th>
                <th>Risk Level</th>
                <th>Confidence</th>
                <th>Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {getPaginatedData(filteredPredictions).map((item, idx) => {
                const delayHrs = Math.max(0, Number(item.predicted_delay_hours || 0));
                return (
                  <tr key={item.shipment_id || idx} onClick={() => onItemClick(item, 'Delivery Delay Forecast')}>
                    <td><strong style={{ color: 'var(--accent-cyan)' }}>{item.shipment_id}</strong></td>
                    <td>{item.carrier_id}</td>
                    <td>{item.origin} &rarr; {item.destination}</td>
                    <td>{item.predicted_delivery_hours ? formatShortNum(item.predicted_delivery_hours, ' hrs') : (item.predicted_delivery_date || '—')}</td>
                    <td>
                      {delayHrs > 0 ? (
                        <span style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>
                          +{formatShortNum(delayHrs, 'h delay')}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--accent-emerald)' }}>On Time</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${(item.delay_risk || 'LOW').toLowerCase()}`}>
                        {item.delay_risk || 'LOW'}
                      </span>
                    </td>
                    <td>{(item.prediction_confidence ? (item.prediction_confidence * 100).toFixed(0) : 95)}%</td>
                    <td>
                      <span className="badge info">{item.recommended_action || item.recommendation || 'Standard Transit'}</span>
                    </td>
                  </tr>
                );
              })}
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
                <th>Shipment ID</th>
                <th>Carrier Name</th>
                <th>Distance</th>
                <th>Route Efficiency</th>
                <th>Weather Risk</th>
                <th>Traffic Risk</th>
                <th>Shipment Value</th>
                <th>Risk Category</th>
              </tr>
            </thead>
            <tbody>
              {getPaginatedData(filteredFeatures).map((item, idx) => (
                <tr key={item.shipment_id || idx} onClick={() => onItemClick(item, 'Transit Route Details')}>
                  <td><strong style={{ color: 'var(--accent-cyan)' }}>{item.shipment_id}</strong></td>
                  <td>{item.carrier_name || item.carrier_id}</td>
                  <td>{item.distance_km ? `${Math.round(item.distance_km).toLocaleString()} km` : '—'}</td>
                  <td>{item.route_efficiency ? `${(item.route_efficiency * 100).toFixed(0)}%` : '—'}</td>
                  <td>{item.weather_risk_score ? (item.weather_risk_score * 100).toFixed(0) + '%' : 'Low'}</td>
                  <td>{item.traffic_risk_score ? (item.traffic_risk_score * 100).toFixed(0) + '%' : 'Low'}</td>
                  <td>${item.total_shipment_value ? Math.round(item.total_shipment_value).toLocaleString() : '—'}</td>
                  <td>
                    <span className={`badge ${(item.risk_level || 'LOW').toLowerCase()}`}>
                      {item.risk_level || 'LOW'}
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
