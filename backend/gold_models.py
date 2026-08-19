from datetime import date, datetime
from typing import Optional, Union
from pydantic import BaseModel


# ─────────────────────────────────────────────
# 1. Delivery ML Features & Predictions
# ─────────────────────────────────────────────
class DeliveryMLFeature(BaseModel):
    shipment_id: str
    carrier_id: Optional[str] = None
    carrier_name: Optional[str] = None
    origin: Optional[str] = None
    destination: Optional[str] = None
    vehicle_id: Optional[str] = None
    driver_id: Optional[str] = None
    distance_km: Optional[int] = None
    estimated_delivery_hours: Optional[float] = None
    actual_delivery_hours: Optional[float] = None
    route_efficiency: Optional[float] = None
    weather_risk_score: Optional[float] = None
    traffic_risk_score: Optional[float] = None
    combined_risk_score: Optional[float] = None
    total_units_shipped: Optional[int] = None
    total_shipment_value: Optional[float] = None
    orders_in_shipment: Optional[int] = None
    products_in_shipment: Optional[int] = None
    earliest_order_date: Optional[Union[datetime, str]] = None
    estimated_delivery_date: Optional[str] = None
    actual_delivery_date: Optional[str] = None
    shipment_status: Optional[str] = None
    is_delayed: Optional[bool] = None
    delay_hours: Optional[float] = None
    delivery_time_variance_hours: Optional[float] = None
    delay_risk_probability: Optional[float] = None
    avg_speed_kmh: Optional[float] = None
    distance_category: Optional[str] = None
    risk_level: Optional[str] = None
    eta_accuracy_score: Optional[float] = None
    load_value_per_km: Optional[float] = None
    units_per_km: Optional[float] = None
    recommended_action: Optional[str] = None
    shipment_complexity_score: Optional[float] = None
    created_at: Optional[Union[datetime, str]] = None


class DeliveryPrediction(BaseModel):
    shipment_id: str
    carrier_id: Optional[str] = None
    origin: Optional[str] = None
    destination: Optional[str] = None
    predicted_delivery_hours: Optional[float] = None
    predicted_eta_variance_hours: Optional[float] = None
    predicted_delivery_date: Optional[str] = None
    predicted_delivery_time: Optional[str] = None
    predicted_delay_hours: Optional[float] = None
    delay_risk: Optional[str] = None
    prediction_confidence: Optional[float] = None
    problem_detected: Optional[bool] = None
    problem_severity: Optional[str] = None
    problem_description: Optional[str] = None
    optimal_carrier: Optional[str] = None
    route_optimization_score: Optional[float] = None
    time_savings_hours: Optional[float] = None
    cost_optimization_pct: Optional[float] = None
    recommendation: Optional[str] = None
    action_priority: Optional[str] = None
    recommended_action: Optional[str] = None
    carrier_reliability: Optional[str] = None
    prediction_timestamp: Optional[Union[datetime, str]] = None
    prediction_date: Optional[Union[date, str]] = None
    model_name: Optional[str] = None
    model_version: Optional[Union[str, int]] = None


# ─────────────────────────────────────────────
# 2. Inventory ML Features & Predictions
# ─────────────────────────────────────────────
class InventoryMLFeature(BaseModel):
    product_id: str
    warehouse_id: str
    total_orders: Optional[int] = None
    total_demand: Optional[int] = None
    avg_order_quantity: Optional[float] = None
    std_order_quantity: Optional[float] = None
    min_order_quantity: Optional[int] = None
    max_order_quantity: Optional[int] = None
    avg_stock_level: Optional[float] = None
    min_stock_level: Optional[int] = None
    max_stock_level: Optional[int] = None
    avg_days_of_inventory: Optional[float] = None
    times_critical: Optional[int] = None
    times_low: Optional[int] = None
    times_optimal: Optional[int] = None
    times_excess: Optional[int] = None
    avg_unit_cost: Optional[float] = None
    total_revenue: Optional[float] = None
    avg_fulfillment_days: Optional[float] = None
    perfect_orders: Optional[int] = None
    first_order_date: Optional[Union[datetime, str]] = None
    last_order_date: Optional[Union[datetime, str]] = None
    unique_days_of_week_ordered: Optional[int] = None
    unique_customers: Optional[int] = None
    daily_demand_rate: Optional[float] = None
    predicted_days_to_stockout: Optional[float] = None
    stockout_risk_score: Optional[float] = None
    demand_variability: Optional[float] = None
    recommended_safety_stock: Optional[int] = None
    recommended_restock_qty: Optional[int] = None
    stock_health_score: Optional[float] = None
    excess_stock_risk: Optional[float] = None
    recommended_action: Optional[str] = None
    days_since_last_order: Optional[int] = None
    product_activity_score: Optional[float] = None
    stock_status_prediction: Optional[str] = None
    created_at: Optional[Union[datetime, str]] = None


class InventoryPrediction(BaseModel):
    product_id: str
    warehouse_id: str
    predicted_stock_status: Optional[str] = None
    prediction_confidence: Optional[float] = None
    problem_detected: Optional[bool] = None
    problem_severity: Optional[str] = None
    problem_description: Optional[str] = None
    estimated_impact_days: Optional[int] = None
    optimal_reorder_qty: Optional[int] = None
    optimal_safety_stock: Optional[int] = None
    reorder_urgency_score: Optional[float] = None
    next_reorder_date: Optional[str] = None
    recommendation: Optional[str] = None
    action_priority: Optional[str] = None
    estimated_cost_impact: Optional[float] = None
    prediction_timestamp: Optional[Union[datetime, str]] = None
    prediction_date: Optional[Union[date, str]] = None
    model_name: Optional[str] = None
    model_version: Optional[Union[str, int]] = None


# ─────────────────────────────────────────────
# 3. Procurement ML Features & Predictions
# ─────────────────────────────────────────────
class ProcurementMLFeature(BaseModel):
    carrier_id: str
    product_id: str
    warehouse_id: str
    carrier_name: Optional[str] = None
    historical_order_count: Optional[int] = None
    total_quantity_ordered: Optional[int] = None
    avg_unit_cost: Optional[float] = None
    avg_fulfillment_days: Optional[float] = None
    std_fulfillment_days: Optional[float] = None
    min_fulfillment_days: Optional[int] = None
    max_fulfillment_days: Optional[int] = None
    total_delayed_shipments: Optional[int] = None
    avg_delay_hours: Optional[float] = None
    max_delay_hours: Optional[float] = None
    on_time_deliveries: Optional[int] = None
    perfect_orders: Optional[int] = None
    avg_route_efficiency: Optional[float] = None
    avg_weather_risk: Optional[float] = None
    avg_traffic_risk: Optional[float] = None
    avg_combined_risk: Optional[float] = None
    avg_distance_km: Optional[float] = None
    total_distance_km: Optional[int] = None
    first_order_date: Optional[Union[datetime, str]] = None
    last_order_date: Optional[Union[datetime, str]] = None
    avg_stock_at_order: Optional[float] = None
    avg_days_inventory: Optional[float] = None
    supplier_delay_risk: Optional[float] = None
    on_time_rate: Optional[float] = None
    delivery_consistency_score: Optional[float] = None
    supplier_reliability_score: Optional[float] = None
    days_since_last_order: Optional[int] = None
    supplier_tenure_days: Optional[int] = None
    order_frequency: Optional[float] = None
    recommended_order_qty: Optional[int] = None
    reorder_urgency: Optional[int] = None
    supplier_risk_category: Optional[str] = None
    created_at: Optional[Union[datetime, str]] = None


class ProcurementPrediction(BaseModel):
    carrier_id: str
    product_id: str
    warehouse_id: str
    predicted_delay_risk: Optional[float] = None
    risk_category: Optional[str] = None
    predicted_fulfillment_days: Optional[float] = None
    prediction_confidence: Optional[float] = None
    problem_detected: Optional[bool] = None
    problem_severity: Optional[str] = None
    problem_description: Optional[str] = None
    optimal_order_qty: Optional[int] = None
    optimal_order_timing_days: Optional[int] = None
    alternative_supplier_recommended: Optional[bool] = None
    procurement_cost_impact: Optional[float] = None
    recommendation: Optional[str] = None
    action_priority: Optional[str] = None
    recommended_action: Optional[str] = None
    prediction_timestamp: Optional[Union[datetime, str]] = None
    prediction_date: Optional[Union[date, str]] = None
    model_name: Optional[str] = None
    model_version: Optional[Union[str, int]] = None
