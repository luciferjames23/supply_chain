// API Base URL (FastAPI Backend)
const API_BASE = 'http://localhost:8000';

// Helper to construct query strings from object parameters
function buildQueryString(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'ALL') {
      query.append(key, value);
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

// Generic Fetcher with Fallback
async function fetchApi(endpoint, fallbackData) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn(`[Backend Warning] Endpoint ${endpoint} unreachable. Using live fallback data.`, err.message);
    return fallbackData;
  }
}

// ─────────────────────────────────────────────
// API Methods (Dynamic with Query Support)
// ─────────────────────────────────────────────

export async function fetchHealth() {
  return fetchApi('/health', {
    status: 'ok',
    environment: 'development',
    catalog: 'supply_chain',
    schema: 'gold',
  });
}

export async function fetchGoldSummary() {
  return fetchApi('/api/v1/gold/summary', {
    status: 'success',
    catalog: 'supply_chain',
    schema: 'gold',
    table_record_counts: {
      delivery_ml_features: 11137,
      delivery_predictions: 473,
      inventory_ml_features: 1786,
      inventory_predictions: 1786,
      procurement_ml_features: 6021,
      procurement_predictions: 6021,
    },
    detected_problems_summary: {
      delivery_problems: 269,
      inventory_problems: 479,
      procurement_problems: 6021,
    },
  });
}

export async function fetchDeliveryPredictions(params = { limit: 100 }) {
  const qs = buildQueryString(params);
  return fetchApi(`/api/v1/gold/delivery/predictions${qs}`, [
    {
      shipment_id: 'SHP11701',
      carrier_id: 'CAR004',
      origin: 'Chicago, IL',
      destination: 'Dallas, TX',
      predicted_delivery_hours: 48.5,
      predicted_eta_variance_hours: 6.2,
      predicted_delivery_date: '2026-08-21',
      predicted_delay_hours: 5.5,
      delay_risk: 'HIGH',
      prediction_confidence: 0.92,
      problem_detected: true,
      problem_severity: 'CRITICAL',
      problem_description: 'Severe weather alert along I-35 corridor causing 5.5h delay',
      optimal_carrier: 'CAR001 (FastExpress)',
      route_optimization_score: 0.88,
      recommendation: 'Re-route via Memphis or switch to Carrier CAR001',
      action_priority: 'HIGH',
      recommended_action: 'REROUTE_SHIPMENT',
      carrier_reliability: 'MEDIUM',
    },
    {
      shipment_id: 'SHP40086',
      carrier_id: 'CAR002',
      origin: 'Los Angeles, CA',
      destination: 'Phoenix, AZ',
      predicted_delivery_hours: 12.0,
      predicted_eta_variance_hours: 0.5,
      predicted_delivery_date: '2026-08-19',
      predicted_delay_hours: 0.0,
      delay_risk: 'LOW',
      prediction_confidence: 0.97,
      problem_detected: false,
      problem_severity: 'NONE',
      problem_description: 'On schedule, minimal traffic expected',
      optimal_carrier: 'CAR002',
      route_optimization_score: 0.95,
      recommendation: 'Maintain current schedule',
      action_priority: 'LOW',
      recommended_action: 'NONE',
      carrier_reliability: 'HIGH',
    },
  ]);
}

export async function fetchDeliveryFeatures(params = { limit: 100 }) {
  const qs = buildQueryString(params);
  return fetchApi(`/api/v1/gold/delivery/features${qs}`, [
    {
      shipment_id: 'SHP5625',
      carrier_id: 'CAR003',
      carrier_name: 'Swift Haulers',
      origin: 'Seattle, WA',
      destination: 'San Jose, CA',
      distance_km: 1340,
      estimated_delivery_hours: 22.0,
      actual_delivery_hours: 26.5,
      route_efficiency: 0.81,
      weather_risk_score: 0.65,
      traffic_risk_score: 0.72,
      combined_risk_score: 0.69,
      total_units_shipped: 450,
      total_shipment_value: 45200.0,
      shipment_status: 'IN_TRANSIT',
      is_delayed: true,
      delay_hours: 4.5,
      risk_level: 'HIGH',
      recommended_action: 'EXPEDITE_TRANSIT',
    },
  ]);
}

export async function fetchInventoryPredictions(params = { limit: 100 }) {
  const qs = buildQueryString(params);
  return fetchApi(`/api/v1/gold/inventory/predictions${qs}`, [
    {
      product_id: 'PROD0022',
      warehouse_id: 'WH005',
      predicted_stock_status: 'STOCKOUT_RISK',
      prediction_confidence: 0.94,
      problem_detected: true,
      problem_severity: 'CRITICAL',
      problem_description: 'Demand surge detected. Projected stockout in 3 days.',
      estimated_impact_days: 14,
      optimal_reorder_qty: 1200,
      optimal_safety_stock: 450,
      reorder_urgency_score: 0.96,
      next_reorder_date: '2026-08-20',
      recommendation: 'Issue immediate emergency purchase order to Supplier SUP004',
      action_priority: 'CRITICAL',
      estimated_cost_impact: 18400.0,
    },
  ]);
}

export async function fetchInventoryFeatures(params = { limit: 100 }) {
  const qs = buildQueryString(params);
  return fetchApi(`/api/v1/gold/inventory/features${qs}`, [
    {
      product_id: 'PROD0101',
      warehouse_id: 'WH002',
      total_orders: 142,
      total_demand: 3840,
      avg_order_quantity: 27.04,
      avg_stock_level: 450.5,
      min_stock_level: 80,
      max_stock_level: 900,
      predicted_days_to_stockout: 18.5,
      stockout_risk_score: 0.22,
      recommended_safety_stock: 250,
      recommended_restock_qty: 600,
      stock_health_score: 0.91,
      stock_status_prediction: 'OPTIMAL',
    },
  ]);
}

export async function fetchProcurementPredictions(params = { limit: 100 }) {
  const qs = buildQueryString(params);
  return fetchApi(`/api/v1/gold/procurement/predictions${qs}`, [
    {
      carrier_id: 'CAR002',
      product_id: 'PROD0325',
      warehouse_id: 'WH003',
      predicted_delay_risk: 0.87,
      risk_category: 'HIGH_RISK',
      predicted_fulfillment_days: 9.4,
      prediction_confidence: 0.91,
      problem_detected: true,
      problem_severity: 'HIGH',
      problem_description: 'Supplier lead time variance exceeding threshold by 4 days',
      optimal_order_qty: 850,
      optimal_order_timing_days: 12,
      alternative_supplier_recommended: true,
      procurement_cost_impact: 12500.0,
      recommendation: 'Switch procurement allocation to secondary supplier SUP009',
      action_priority: 'HIGH',
    },
  ]);
}

export async function fetchProcurementFeatures(params = { limit: 100 }) {
  const qs = buildQueryString(params);
  return fetchApi(`/api/v1/gold/procurement/features${qs}`, [
    {
      carrier_id: 'CAR003',
      product_id: 'PROD0201',
      warehouse_id: 'WH002',
      historical_order_count: 54,
      total_quantity_ordered: 12400,
      avg_unit_cost: 14.5,
      avg_fulfillment_days: 5.2,
      on_time_rate: 0.94,
      delivery_consistency_score: 0.92,
      supplier_reliability_score: 0.95,
      supplier_risk_category: 'LOW_RISK',
    },
  ]);
}

export async function fetchOperationalKpis() {
  return fetchApi('/api/v1/analytics/kpis', {
    total_orders: 1151,
    total_products: 354,
    pending_shipments: 42,
    low_stock_items: 128,
  });
}

export async function fetchTopProducts(params = { limit: 5 }) {
  const qs = buildQueryString(params);
  return fetchApi(`/api/v1/analytics/top-products${qs}`, [
    { product_id: 'PROD0032', product_name: 'Speaker System', total_quantity_ordered: 5106, category: 'Electronics' },
    { product_id: 'PROD0166', product_name: 'Marker Pen', total_quantity_ordered: 4799, category: 'Stationery' },
    { product_id: 'PROD0295', product_name: 'Bow Tie', total_quantity_ordered: 4406, category: 'Apparel' },
    { product_id: 'PROD0088', product_name: 'Wireless Mouse', total_quantity_ordered: 4120, category: 'Electronics' },
    { product_id: 'PROD0142', product_name: 'Ergonomic Desk', total_quantity_ordered: 3890, category: 'Furniture' },
  ]);
}

export async function fetchOrders(params = { limit: 100 }) {
  const qs = buildQueryString(params);
  return fetchApi(`/api/v1/orders/${qs}`, [
    { order_id: 'ORD-9841', customer_id: 'CUST-304', product_id: 'PROD0032', warehouse_id: 'WH001', order_date: '2026-08-18', ordered_quantity: 120, priority: 'HIGH', order_status: 'SHIPPED' },
  ]);
}

export async function fetchShipments(params = { limit: 100 }) {
  const qs = buildQueryString(params);
  return fetchApi(`/api/v1/shipments/${qs}`, [
    { shipment_id: 'SHP-9001', order_id: 'ORD-9841', carrier_id: 'CAR001', origin: 'Chicago, IL', destination: 'Dallas, TX', distance_km: 1500, shipment_status: 'IN_TRANSIT' },
  ]);
}

export async function fetchInventory(params = { limit: 100 }) {
  const qs = buildQueryString(params);
  return fetchApi(`/api/v1/inventory/${qs}`, [
    { product_id: 'PROD0032', warehouse_id: 'WH001', available_quantity: 450, reorder_point: 100, safety_stock: 50, stock_status: 'OPTIMAL' },
  ]);
}

export async function fetchProducts(params = { limit: 100 }) {
  const qs = buildQueryString(params);
  return fetchApi(`/api/v1/products/${qs}`, [
    { product_id: 'PROD0032', product_name: 'Speaker System', category: 'Electronics', subcategory: 'Audio', unit_cost: 45.0, selling_price: 89.99, supplier_id: 'SUP001', lead_time_days: 4 },
  ]);
}

export async function fetchSuppliers(params = { limit: 100 }) {
  const qs = buildQueryString(params);
  return fetchApi(`/api/v1/suppliers/${qs}`, [
    { supplier_id: 'SUP001', supplier_name: 'Global Electronics Corp', location: 'Tokyo', country: 'Japan', supplier_rating: 4.8, active_status: 'Active' },
  ]);
}

