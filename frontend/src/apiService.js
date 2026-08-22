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
    console.warn(`[Backend Warning] Endpoint ${endpoint} unreachable. Using live fallback dataset.`, err.message);
    return fallbackData;
  }
}

// Helper generators for fallback dataset generation (120+ mock records each when backend is down)
function generateMockDeliveryPredictions(count = 120) {
  const origins = ['Chicago, IL', 'Los Angeles, CA', 'Seattle, WA', 'Atlanta, GA', 'New York, NY', 'Dallas, TX', 'Miami, FL', 'Denver, CO'];
  const destinations = ['Dallas, TX', 'Phoenix, AZ', 'San Jose, CA', 'Boston, MA', 'Houston, TX', 'Detroit, MI', 'Charlotte, NC', 'Las Vegas, NV'];
  const risks = ['HIGH', 'MEDIUM', 'LOW'];
  const actions = ['REROUTE_SHIPMENT', 'EXPEDITE_TRANSIT', 'NOTIFY_CUSTOMER', 'NONE', 'SWITCH_CARRIER'];
  
  return Array.from({ length: count }, (_, i) => {
    const risk = risks[i % 3];
    const isHigh = risk === 'HIGH';
    const isMed = risk === 'MEDIUM';
    const delayHrs = isHigh ? (4 + (i % 6)) : (isMed ? (1 + (i % 3)) : 0);
    return {
      shipment_id: `SHP${10000 + i}`,
      carrier_id: `CAR00${(i % 5) + 1}`,
      origin: origins[i % origins.length],
      destination: destinations[i % destinations.length],
      predicted_delivery_hours: Math.round(12 + (i % 48) * 1.5),
      predicted_eta_variance_hours: Number((0.5 + (i % 5) * 0.8).toFixed(1)),
      predicted_delivery_date: `2026-08-${String(18 + (i % 10)).padStart(2, '0')}`,
      predicted_delay_hours: delayHrs,
      delay_risk: risk,
      prediction_confidence: Number((0.85 + (i % 12) * 0.01).toFixed(2)),
      problem_detected: isHigh || isMed,
      problem_severity: isHigh ? 'CRITICAL' : (isMed ? 'WARNING' : 'NONE'),
      problem_description: isHigh ? `Severe congestion along corridor ${i + 1}` : (isMed ? `Minor delay in sorting center` : `On schedule`),
      optimal_carrier: `CAR00${((i + 1) % 5) + 1}`,
      route_optimization_score: Number((0.80 + (i % 20) * 0.01).toFixed(2)),
      recommendation: isHigh ? 'Re-route via express lane or switch carrier' : 'Maintain standard routing',
      action_priority: isHigh ? 'HIGH' : (isMed ? 'MEDIUM' : 'LOW'),
      recommended_action: actions[i % actions.length],
      carrier_reliability: isHigh ? 'LOW' : 'HIGH',
    };
  });
}

function generateMockDeliveryFeatures(count = 120) {
  const carriers = ['Swift Haulers', 'Apex Freight', 'Global Express', 'Vanguard Logistics', 'Prime Transport'];
  const origins = ['Seattle, WA', 'Chicago, IL', 'Memphis, TN', 'Long Beach, CA', 'Columbus, OH'];
  const destinations = ['San Jose, CA', 'Austin, TX', 'Jacksonville, FL', 'Indianapolis, IN', 'Baltimore, MD'];

  return Array.from({ length: count }, (_, i) => ({
    shipment_id: `SHP${5000 + i}`,
    carrier_id: `CAR00${(i % 5) + 1}`,
    carrier_name: carriers[i % carriers.length],
    origin: origins[i % origins.length],
    destination: destinations[i % destinations.length],
    distance_km: 800 + (i * 25) % 2200,
    estimated_delivery_hours: 18 + (i % 30),
    actual_delivery_hours: 20 + (i % 34),
    route_efficiency: Number((0.75 + (i % 22) * 0.01).toFixed(2)),
    weather_risk_score: Number((0.10 + (i % 80) * 0.01).toFixed(2)),
    traffic_risk_score: Number((0.15 + (i % 75) * 0.01).toFixed(2)),
    combined_risk_score: Number((0.20 + (i % 70) * 0.01).toFixed(2)),
    total_units_shipped: 200 + (i * 15) % 1000,
    total_shipment_value: Math.round(15000 + (i * 1250) % 85000),
    shipment_status: i % 4 === 0 ? 'DELIVERED' : 'IN_TRANSIT',
    is_delayed: i % 3 === 0,
    delay_hours: i % 3 === 0 ? 3.5 : 0,
    risk_level: i % 3 === 0 ? 'HIGH' : (i % 2 === 0 ? 'MEDIUM' : 'LOW'),
    recommended_action: i % 3 === 0 ? 'EXPEDITE_TRANSIT' : 'MONITOR',
  }));
}

function generateMockInventoryPredictions(count = 120) {
  const statuses = ['STOCKOUT_RISK', 'OPTIMAL', 'OVERSTOCK'];
  const priorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  return Array.from({ length: count }, (_, i) => {
    const status = statuses[i % 3];
    return {
      product_id: `PROD${String(i + 1).padStart(4, '0')}`,
      warehouse_id: `WH00${(i % 6) + 1}`,
      predicted_stock_status: status,
      prediction_confidence: Number((0.88 + (i % 10) * 0.01).toFixed(2)),
      problem_detected: status !== 'OPTIMAL',
      problem_severity: status === 'STOCKOUT_RISK' ? 'CRITICAL' : (status === 'OVERSTOCK' ? 'WARNING' : 'NONE'),
      problem_description: status === 'STOCKOUT_RISK' ? 'High sales velocity detected. Stockout imminent.' : 'Stock operating within safe thresholds.',
      estimated_impact_days: status === 'STOCKOUT_RISK' ? 3 + (i % 5) : 30,
      optimal_reorder_qty: 500 + (i * 50) % 2500,
      optimal_safety_stock: 150 + (i * 20) % 600,
      reorder_urgency_score: Number((0.50 + (i % 48) * 0.01).toFixed(2)),
      next_reorder_date: `2026-08-${String(20 + (i % 8)).padStart(2, '0')}`,
      recommendation: status === 'STOCKOUT_RISK' ? 'Issue emergency PO to primary supplier' : 'Rebalance stock across regional WH',
      action_priority: status === 'STOCKOUT_RISK' ? 'CRITICAL' : priorities[i % priorities.length],
      estimated_cost_impact: Math.round(5000 + (i * 850) % 45000),
    };
  });
}

function generateMockInventoryFeatures(count = 120) {
  return Array.from({ length: count }, (_, i) => ({
    product_id: `PROD${String(i + 1).padStart(4, '0')}`,
    warehouse_id: `WH00${(i % 6) + 1}`,
    total_orders: 50 + (i * 7) % 300,
    total_demand: 1200 + (i * 140) % 9000,
    avg_order_quantity: Number((15 + (i % 25) * 1.2).toFixed(1)),
    avg_stock_level: 300 + (i * 35) % 1500,
    min_stock_level: 50,
    max_stock_level: 2000,
    predicted_days_to_stockout: Number((5 + (i % 40) * 0.8).toFixed(1)),
    stockout_risk_score: Number((0.10 + (i % 85) * 0.01).toFixed(2)),
    recommended_safety_stock: 200 + (i * 15) % 500,
    recommended_restock_qty: 800 + (i * 60) % 3000,
    stock_health_score: Number((0.70 + (i % 28) * 0.01).toFixed(2)),
    stock_status_prediction: i % 4 === 0 ? 'LOW_STOCK' : 'OPTIMAL',
  }));
}

function generateMockProcurementPredictions(count = 120) {
  const risks = ['HIGH_RISK', 'MEDIUM_RISK', 'LOW_RISK'];
  return Array.from({ length: count }, (_, i) => ({
    carrier_id: `CAR00${(i % 5) + 1}`,
    product_id: `PROD${String(i + 10).padStart(4, '0')}`,
    warehouse_id: `WH00${(i % 6) + 1}`,
    predicted_delay_risk: Number((0.20 + (i % 75) * 0.01).toFixed(2)),
    risk_category: risks[i % 3],
    predicted_fulfillment_days: Number((3.5 + (i % 12) * 0.6).toFixed(1)),
    prediction_confidence: Number((0.86 + (i % 12) * 0.01).toFixed(2)),
    problem_detected: i % 3 === 0,
    problem_severity: i % 3 === 0 ? 'HIGH' : 'LOW',
    problem_description: i % 3 === 0 ? 'Supplier raw material lead time delay' : 'Supplier performing normally',
    optimal_order_qty: 400 + (i * 45) % 2000,
    optimal_order_timing_days: 7 + (i % 14),
    alternative_supplier_recommended: i % 3 === 0,
    procurement_cost_impact: Math.round(3000 + (i * 600) % 25000),
    recommendation: i % 3 === 0 ? 'Allocate order volume to secondary supplier SUP009' : 'Maintain procurement plan',
    action_priority: i % 3 === 0 ? 'HIGH' : 'LOW',
  }));
}

function generateMockProcurementFeatures(count = 120) {
  const categories = ['LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK'];
  return Array.from({ length: count }, (_, i) => ({
    carrier_id: `CAR00${(i % 5) + 1}`,
    product_id: `PROD${String(i + 10).padStart(4, '0')}`,
    warehouse_id: `WH00${(i % 6) + 1}`,
    historical_order_count: 20 + (i * 3) % 150,
    total_quantity_ordered: 5000 + (i * 450) % 40000,
    avg_unit_cost: Number((8.5 + (i % 40) * 1.5).toFixed(2)),
    avg_fulfillment_days: Number((4.0 + (i % 10) * 0.5).toFixed(1)),
    on_time_rate: Number((0.80 + (i % 19) * 0.01).toFixed(2)),
    delivery_consistency_score: Number((0.82 + (i % 17) * 0.01).toFixed(2)),
    supplier_reliability_score: Number((0.84 + (i % 15) * 0.01).toFixed(2)),
    supplier_risk_category: categories[i % 3],
  }));
}

function generateMockOrders(count = 120) {
  const statuses = ['DELIVERED', 'SHIPPED', 'PROCESSING', 'PENDING'];
  const priorities = ['HIGH', 'MEDIUM', 'LOW'];
  return Array.from({ length: count }, (_, i) => ({
    order_id: `ORD-${9000 + i}`,
    customer_id: `CUST-${100 + (i % 50)}`,
    product_id: `PROD${String((i % 40) + 1).padStart(4, '0')}`,
    warehouse_id: `WH00${(i % 6) + 1}`,
    order_date: `2026-08-${String(1 + (i % 20)).padStart(2, '0')}`,
    ordered_quantity: 10 + (i * 12) % 300,
    priority: priorities[i % 3],
    order_status: statuses[i % 4],
  }));
}

function generateMockShipments(count = 120) {
  const statuses = ['IN_TRANSIT', 'DELIVERED', 'DELAYED', 'DISPATCHED'];
  const origins = ['Chicago, IL', 'Seattle, WA', 'Los Angeles, CA', 'Atlanta, GA'];
  const dests = ['Dallas, TX', 'San Jose, CA', 'Phoenix, AZ', 'Boston, MA'];
  return Array.from({ length: count }, (_, i) => ({
    shipment_id: `SHP-${8000 + i}`,
    order_id: `ORD-${9000 + i}`,
    carrier_id: `CAR00${(i % 5) + 1}`,
    carrier_name: `Carrier ${i % 5 + 1}`,
    origin: origins[i % origins.length],
    destination: dests[i % dests.length],
    distance_km: 600 + (i * 30) % 2500,
    shipment_status: statuses[i % 4],
  }));
}

function generateMockInventory(count = 120) {
  const statuses = ['OPTIMAL', 'LOW_STOCK', 'OVERSTOCK', 'CRITICAL'];
  const prodNames = ['Speaker System', 'Marker Pen', 'Wireless Mouse', 'Ergonomic Desk', 'Smart Watch', 'USB-C Cable', 'Monitor Arm', 'Keyboard'];
  return Array.from({ length: count }, (_, i) => ({
    product_id: `PROD${String(i + 1).padStart(4, '0')}`,
    product_name: `${prodNames[i % prodNames.length]} Mod ${i + 1}`,
    warehouse_id: `WH00${(i % 6) + 1}`,
    available_quantity: 50 + (i * 45) % 2000,
    reorder_point: 100 + (i * 10) % 300,
    safety_stock: 50 + (i * 5) % 150,
    stock_status: statuses[i % 4],
  }));
}

function generateMockProducts(count = 120) {
  const categories = ['Electronics', 'Stationery', 'Apparel', 'Furniture', 'Hardware'];
  const prodNames = ['Audio System', 'Office Pen', 'Wireless Mouse', 'Standing Desk', 'Heavy Duty Bolt', 'Smart Gateway', 'LED Panel'];
  return Array.from({ length: count }, (_, i) => ({
    product_id: `PROD${String(i + 1).padStart(4, '0')}`,
    product_name: `${prodNames[i % prodNames.length]} #${i + 1}`,
    category: categories[i % categories.length],
    subcategory: `Sub-${(i % 4) + 1}`,
    unit_cost: Number((12.0 + (i % 50) * 3.5).toFixed(2)),
    selling_price: Number((25.0 + (i % 50) * 6.5).toFixed(2)),
    supplier_id: `SUP00${(i % 8) + 1}`,
    lead_time_days: 3 + (i % 10),
  }));
}

function generateMockSuppliers(count = 120) {
  const countries = ['Japan', 'USA', 'Germany', 'South Korea', 'Taiwan', 'Canada', 'Mexico', 'UK'];
  const statuses = ['Active', 'Active', 'Inactive', 'Under Review'];
  return Array.from({ length: count }, (_, i) => ({
    supplier_id: `SUP${String(i + 1).padStart(3, '0')}`,
    supplier_name: `Supplier Corp ${i + 1}`,
    location: `City-${(i % 20) + 1}`,
    country: countries[i % countries.length],
    supplier_rating: Number((3.5 + (i % 15) * 0.1).toFixed(1)),
    active_status: statuses[i % statuses.length],
  }));
}

// ─────────────────────────────────────────────
// Exported API Methods (Fetching Full Datasets)
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

export async function fetchDeliveryPredictions(params = { limit: 50000 }) {
  const qs = buildQueryString(params);
  return fetchApi(`/api/v1/gold/delivery/predictions${qs}`, generateMockDeliveryPredictions(150));
}

export async function fetchDeliveryFeatures(params = { limit: 50000 }) {
  const qs = buildQueryString(params);
  return fetchApi(`/api/v1/gold/delivery/features${qs}`, generateMockDeliveryFeatures(150));
}

export async function fetchInventoryPredictions(params = { limit: 50000 }) {
  const qs = buildQueryString(params);
  return fetchApi(`/api/v1/gold/inventory/predictions${qs}`, generateMockInventoryPredictions(150));
}

export async function fetchInventoryFeatures(params = { limit: 50000 }) {
  const qs = buildQueryString(params);
  return fetchApi(`/api/v1/gold/inventory/features${qs}`, generateMockInventoryFeatures(150));
}

export async function fetchProcurementPredictions(params = { limit: 50000 }) {
  const qs = buildQueryString(params);
  return fetchApi(`/api/v1/gold/procurement/predictions${qs}`, generateMockProcurementPredictions(150));
}

export async function fetchProcurementFeatures(params = { limit: 50000 }) {
  const qs = buildQueryString(params);
  return fetchApi(`/api/v1/gold/procurement/features${qs}`, generateMockProcurementFeatures(150));
}

export async function fetchOperationalKpis() {
  return fetchApi('/api/v1/analytics/kpis', {
    total_orders: 1151,
    total_products: 354,
    pending_shipments: 42,
    low_stock_items: 128,
  });
}

export async function fetchTopProducts(params = { limit: 10 }) {
  const qs = buildQueryString(params);
  return fetchApi(`/api/v1/analytics/top-products${qs}`, [
    { product_id: 'PROD0032', product_name: 'Speaker System', total_quantity_ordered: 5106, category: 'Electronics' },
    { product_id: 'PROD0166', product_name: 'Marker Pen', total_quantity_ordered: 4799, category: 'Stationery' },
    { product_id: 'PROD0295', product_name: 'Bow Tie', total_quantity_ordered: 4406, category: 'Apparel' },
    { product_id: 'PROD0088', product_name: 'Wireless Mouse', total_quantity_ordered: 4120, category: 'Electronics' },
    { product_id: 'PROD0142', product_name: 'Ergonomic Desk', total_quantity_ordered: 3890, category: 'Furniture' },
  ]);
}

export async function fetchOrders(params = { limit: 50000 }) {
  const qs = buildQueryString(params);
  return fetchApi(`/api/v1/orders/${qs}`, generateMockOrders(150));
}

export async function fetchShipments(params = { limit: 50000 }) {
  const qs = buildQueryString(params);
  return fetchApi(`/api/v1/shipments/${qs}`, generateMockShipments(150));
}

export async function fetchInventory(params = { limit: 50000 }) {
  const qs = buildQueryString(params);
  return fetchApi(`/api/v1/inventory/${qs}`, generateMockInventory(150));
}

export async function fetchProducts(params = { limit: 50000 }) {
  const qs = buildQueryString(params);
  return fetchApi(`/api/v1/products/${qs}`, generateMockProducts(150));
}

export async function fetchSuppliers(params = { limit: 50000 }) {
  const qs = buildQueryString(params);
  return fetchApi(`/api/v1/suppliers/${qs}`, generateMockSuppliers(150));
}
