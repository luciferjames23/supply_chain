import React from 'react';
import { AlertTriangle, Truck, Package, ShoppingCart, TrendingUp, Layers, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function OverviewView({ goldSummary, kpis, topProducts, onSelectTab }) {
  const deliveryProblems = goldSummary?.detected_problems_summary?.delivery_problems || 269;
  const inventoryProblems = goldSummary?.detected_problems_summary?.inventory_problems || 479;
  const procurementProblems = goldSummary?.detected_problems_summary?.procurement_problems || 6021;
  const totalAlerts = deliveryProblems + inventoryProblems + procurementProblems;

  return (
    <div>
      {/* Critical ML Alert Banner */}
      <div className="alert-banner">
        <div className="alert-left">
          <ShieldAlert className="alert-icon" size={28} />
          <div>
            <h3 className="alert-title">{totalAlerts.toLocaleString()} Databricks ML Anomaly Risk Alerts Detected</h3>
            <p className="alert-desc">
              ML models flag <strong>{deliveryProblems} delivery delay risks</strong>, <strong>{inventoryProblems} stockout alerts</strong>, and <strong>{procurementProblems} procurement lead-time anomalies</strong> across the Gold schema.
            </p>
          </div>
        </div>
        <button 
          className="nav-tab active" 
          onClick={() => onSelectTab('delivery')}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          Review Predictions
        </button>
      </div>

      {/* KPI Stat Grid */}
      <div className="kpi-grid">
        <div className="glass-card kpi-card cyan">
          <div>
            <div className="kpi-title">Total Orders (Live)</div>
            <div className="kpi-value">{kpis?.total_orders?.toLocaleString() || '1,151'}</div>
            <div className="kpi-sub">Active order volume across hubs</div>
          </div>
          <div className="kpi-icon">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="glass-card kpi-card rose">
          <div>
            <div className="kpi-title">Delivery Delay Risk</div>
            <div className="kpi-value">{deliveryProblems}</div>
            <div className="kpi-sub">Shipments with predicted ETA delay</div>
          </div>
          <div className="kpi-icon" style={{ color: 'var(--accent-rose)' }}>
            <Truck size={24} />
          </div>
        </div>

        <div className="glass-card kpi-card amber">
          <div>
            <div className="kpi-title">Stockout Alert Items</div>
            <div className="kpi-value">{inventoryProblems}</div>
            <div className="kpi-sub">Products nearing critical threshold</div>
          </div>
          <div className="kpi-icon" style={{ color: 'var(--accent-amber)' }}>
            <Package size={24} />
          </div>
        </div>

        <div className="glass-card kpi-card purple">
          <div>
            <div className="kpi-title">Procurement Lead Time Risk</div>
            <div className="kpi-value">{procurementProblems.toLocaleString()}</div>
            <div className="kpi-sub">Supplier delay risk predictions</div>
          </div>
          <div className="kpi-icon" style={{ color: 'var(--accent-purple)' }}>
            <ShoppingCart size={24} />
          </div>
        </div>
      </div>

      {/* Gold Tables Summary & Top Products Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        {/* Databricks Gold Schema Index */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: '#fff' }}>
              Databricks Gold Schema Tables Index
            </h3>
            <span className="badge info">6 Primary ML Tables</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {goldSummary?.table_record_counts && Object.entries(goldSummary.table_record_counts).map(([tbl, count]) => (
              <div 
                key={tbl} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '0.75rem 1rem', 
                  borderRadius: 'var(--radius-md)', 
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-light)' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Layers size={18} style={{ color: 'var(--accent-cyan)' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
                    supply_chain.gold.{tbl}
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {count.toLocaleString()} rows
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Ordered Products */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: '#fff' }}>
              Top Products Demand Leaderboard
            </h3>
            <span className="badge success">Live Master Data</span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Ordered Qty</th>
                </tr>
              </thead>
              <tbody>
                {topProducts && topProducts.map((p) => (
                  <tr key={p.product_id}>
                    <td><strong style={{ color: 'var(--accent-cyan)' }}>{p.product_id}</strong></td>
                    <td>{p.product_name}</td>
                    <td><span className="badge info">{p.category || 'General'}</span></td>
                    <td><strong>{p.total_quantity_ordered?.toLocaleString()} units</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
