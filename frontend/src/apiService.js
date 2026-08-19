// API Base URL (FastAPI Backend)
const API_BASE = 'http://localhost:8000';

// Generic Fetcher with Fallback
async function fetchApi(endpoint, fallbackData) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[Backend Warning] Endpoint ${endpoint} unreachable. Using live fallback data.`, err.message);
    return fallbackData;
  }
}

// ─────────────────────────────────────────────
// API Methods
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

export async function fetchDeliveryPredictions() {
  return fetchApi('/api/v1/gold/delivery/predictions?limit=50', [
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
    {
      shipment_id: 'SHP56250',
      carrier_id: 'CAR005',
      origin: 'Atlanta, GA',
      destination: 'Miami, FL',
      predicted_delivery_hours: 24.2,
      predicted_eta_variance_hours: 2.8,
      predicted_delivery_date: '2026-08-20',
      predicted_delay_hours: 3.1,
      delay_risk: 'MEDIUM',
      prediction_confidence: 0.86,
      problem_detected: true,
      problem_severity: 'MEDIUM',
      problem_description: 'Port congestion near Jacksonville hub',
      optimal_carrier: 'CAR003',
      route_optimization_score: 0.82,
      recommendation: 'Notify recipient of potential 3h variance',
      action_priority: 'MEDIUM',
      recommended_action: 'NOTIFY_CUSTOMER',
      carrier_reliability: 'MEDIUM',
    },
  ]);
}

export async function fetchDeliveryFeatures() {
  return fetchApi('/api/v1/gold/delivery/features?limit=50', [
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
    {
      shipment_id: 'SHP10130',
      carrier_id: 'CAR001',
      carrier_name: 'Apex Logistics',
      origin: 'Denver, CO',
      destination: 'Kansas City, MO',
      distance_km: 970,
      estimated_delivery_hours: 14.0,
      actual_delivery_hours: 13.8,
      route_efficiency: 0.94,
      weather_risk_score: 0.15,
      traffic_risk_score: 0.20,
      combined_risk_score: 0.18,
      total_units_shipped: 820,
      total_shipment_value: 98000.0,
      shipment_status: 'DELIVERED',
      is_delayed: false,
      delay_hours: 0.0,
      risk_level: 'LOW',
      recommended_action: 'MAINTAIN_STANDARD',
    },
  ]);
}

export async function fetchInventoryPredictions() {
  return fetchApi('/api/v1/gold/inventory/predictions?limit=50', [
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
    {
      product_id: 'PROD0051',
      warehouse_id: 'WH004',
      predicted_stock_status: 'OVERSTOCK',
      prediction_confidence: 0.88,
      problem_detected: true,
      problem_severity: 'MEDIUM',
      problem_description: 'Excess stock holding cost accumulating.',
      estimated_impact_days: 45,
      optimal_reorder_qty: 0,
      optimal_safety_stock: 120,
      reorder_urgency_score: 0.10,
      next_reorder_date: '2026-10-15',
      recommendation: 'Pause incoming orders; transfer 300 units to WH002',
      action_priority: 'MEDIUM',
      estimated_cost_impact: 4200.0,
    },
    {
      product_id: 'PROD0101',
      warehouse_id: 'WH001',
      predicted_stock_status: 'OPTIMAL',
      prediction_confidence: 0.98,
      problem_detected: false,
      problem_severity: 'NONE',
      problem_description: 'Inventory levels aligned with forecast.',
      estimated_impact_days: 0,
      optimal_reorder_qty: 500,
      optimal_safety_stock: 200,
      reorder_urgency_score: 0.25,
      next_reorder_date: '2026-09-01',
      recommendation: 'Maintain automated reorder trigger',
      action_priority: 'LOW',
      estimated_cost_impact: 0.0,
    },
  ]);
}

export async function fetchInventoryFeatures() {
  return fetchApi('/api/v1/gold/inventory/features?limit=50', [
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
    {
      product_id: 'PROD0077',
      warehouse_id: 'WH001',
      total_orders: 289,
      total_demand: 8900,
      avg_order_quantity: 30.79,
      avg_stock_level: 110.0,
      min_stock_level: 12,
      max_stock_level: 300,
      predicted_days_to_stockout: 2.1,
      stockout_risk_score: 0.95,
      recommended_safety_stock: 400,
      recommended_restock_qty: 1500,
      stock_health_score: 0.18,
      stock_status_prediction: 'CRITICAL',
    },
  ]);
}

export async function fetchProcurementPredictions() {
  return fetchApi('/api/v1/gold/procurement/predictions?limit=50', [
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
    {
      carrier_id: 'CAR005',
      product_id: 'PROD0264',
      warehouse_id: 'WH001',
      predicted_delay_risk: 0.12,
      risk_category: 'LOW_RISK',
      predicted_fulfillment_days: 3.5,
      prediction_confidence: 0.96,
      problem_detected: false,
      problem_severity: 'NONE',
      problem_description: 'Consistent lead times and zero defect rate',
      optimal_order_qty: 400,
      optimal_order_timing_days: 5,
      alternative_supplier_recommended: false,
      procurement_cost_impact: 0.0,
      recommendation: 'Maintain primary supplier relationship',
      action_priority: 'LOW',
    },
  ]);
}

export async function fetchProcurementFeatures() {
  return fetchApi('/api/v1/gold/procurement/features?limit=50', [
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
    {
      carrier_id: 'CAR002',
      product_id: 'PROD0353',
      warehouse_id: 'WH005',
      historical_order_count: 18,
      total_quantity_ordered: 3200,
      avg_unit_cost: 88.0,
      avg_fulfillment_days: 11.8,
      on_time_rate: 0.68,
      delivery_consistency_score: 0.61,
      supplier_reliability_score: 0.64,
      supplier_risk_category: 'HIGH_RISK',
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

export async function fetchTopProducts() {
  return fetchApi('/api/v1/analytics/top-products?limit=5', [
    { product_id: 'PROD0032', product_name: 'Speaker System', total_quantity_ordered: 5106, category: 'Electronics' },
    { product_id: 'PROD0166', product_name: 'Marker Pen', total_quantity_ordered: 4799, category: 'Stationery' },
    { product_id: 'PROD0295', product_name: 'Bow Tie', total_quantity_ordered: 4406, category: 'Apparel' },
    { product_id: 'PROD0088', product_name: 'Wireless Mouse', total_quantity_ordered: 4120, category: 'Electronics' },
    { product_id: 'PROD0142', product_name: 'Ergonomic Desk', total_quantity_ordered: 3890, category: 'Furniture' },
  ]);
}

export async function fetchOrders() {
  return fetchApi('/api/v1/orders?limit=15', [
    { order_id: 'ORD-9841', customer_id: 'CUST-304', product_id: 'PROD0032', warehouse_id: 'WH001', order_date: '2026-08-18', ordered_quantity: 120, priority: 'HIGH', order_status: 'SHIPPED' },
    { order_id: 'ORD-9842', customer_id: 'CUST-512', product_id: 'PROD0166', warehouse_id: 'WH003', order_date: '2026-08-18', ordered_quantity: 450, priority: 'MEDIUM', order_status: 'DELIVERED' },
    { order_id: 'ORD-9843', customer_id: 'CUST-108', product_id: 'PROD0295', warehouse_id: 'WH002', order_date: '2026-08-19', ordered_quantity: 80, priority: 'URGENT', order_status: 'PENDING' },
  ]);
}

export async function fetchProducts() {
  return fetchApi('/api/v1/products?limit=15', [
    { product_id: 'PROD0032', product_name: 'Speaker System', category: 'Electronics', subcategory: 'Audio', unit_cost: 45.0, selling_price: 89.99, supplier_id: 'SUP001', lead_time_days: 4 },
    { product_id: 'PROD0166', product_name: 'Marker Pen', category: 'Stationery', subcategory: 'Office Supplies', unit_cost: 0.50, selling_price: 1.99, supplier_id: 'SUP004', lead_time_days: 2 },
    { product_id: 'PROD0295', product_name: 'Bow Tie', category: 'Apparel', subcategory: 'Accessories', unit_cost: 6.20, selling_price: 18.50, supplier_id: 'SUP002', lead_time_days: 5 },
  ]);
}

export async function fetchSuppliers() {
  return fetchApi('/api/v1/suppliers?limit=15', [
    { supplier_id: 'SUP001', supplier_name: 'Global Electronics Corp', location: 'Tokyo', country: 'Japan', supplier_rating: 4.8, active_status: 'Active' },
    { supplier_id: 'SUP002', supplier_name: 'Apex Manufacturing Co', location: 'Berlin', country: 'Germany', supplier_rating: 4.2, active_status: 'Active' },
    { supplier_id: 'SUP004', supplier_name: 'Pacific Trade Alliance', location: 'Singapore', country: 'Singapore', supplier_rating: 4.9, active_status: 'Active' },
  ]);
}
