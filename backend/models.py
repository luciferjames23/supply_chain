from datetime import date, datetime
from typing import Optional, Union
from pydantic import BaseModel


# ─────────────────────────────────────────────
# Orders (supply_chain.live_data.orders)
# ─────────────────────────────────────────────
class Order(BaseModel):
    order_id: str
    customer_id: Optional[str] = None
    product_id: Optional[str] = None
    warehouse_id: Optional[str] = None
    order_date: Optional[Union[datetime, date, str]] = None
    ordered_quantity: Optional[int] = None
    priority: Optional[str] = None
    order_status: Optional[str] = None
    required_date: Optional[Union[datetime, date, str]] = None
    created_at: Optional[Union[datetime, str]] = None
    updated_at: Optional[Union[datetime, str]] = None


# ─────────────────────────────────────────────
# Product Master (supply_chain.live_data.product_master)
# ─────────────────────────────────────────────
class Product(BaseModel):
    product_id: str
    product_name: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    unit_cost: Optional[float] = None
    selling_price: Optional[float] = None
    supplier_id: Optional[str] = None
    lead_time_days: Optional[int] = None
    unit: Optional[str] = None
    weight_kg: Optional[float] = None
    volume: Optional[float] = None
    updated_at: Optional[Union[datetime, str]] = None
    last_synced: Optional[Union[datetime, str]] = None


# ─────────────────────────────────────────────
# Supplier Master (supply_chain.live_data.supplier_master)
# ─────────────────────────────────────────────
class Supplier(BaseModel):
    supplier_id: str
    supplier_name: Optional[str] = None
    location: Optional[str] = None
    country: Optional[str] = None
    supplier_rating: Optional[float] = None
    on_time_delivery_rate: Optional[str] = None
    defect_rate: Optional[str] = None
    average_lead_time_days: Optional[int] = None
    capacity: Optional[int] = None
    unit_price: Optional[float] = None
    active_status: Optional[str] = None
    updated_at: Optional[Union[datetime, str]] = None
    last_performance_review: Optional[Union[datetime, str]] = None
    last_synced: Optional[Union[datetime, str]] = None


# ─────────────────────────────────────────────
# Shipments (supply_chain.live_data.shipments)
# ─────────────────────────────────────────────
class Shipment(BaseModel):
    shipment_id: str
    order_id: Optional[str] = None
    product_id: Optional[str] = None
    quantity: Optional[int] = None
    carrier_id: Optional[str] = None
    carrier_name: Optional[str] = None
    vehicle_id: Optional[str] = None
    driver_id: Optional[str] = None
    origin: Optional[str] = None
    destination: Optional[str] = None
    shipment_status: Optional[str] = None
    planned_departure: Optional[str] = None
    actual_departure: Optional[str] = None
    expected_arrival: Optional[str] = None
    actual_arrival: Optional[str] = None
    distance_km: Optional[int] = None
    estimated_duration: Optional[str] = None
    actual_duration: Optional[str] = None
    created_at: Optional[Union[datetime, str]] = None
    updated_at: Optional[Union[datetime, str]] = None


# ─────────────────────────────────────────────
# Inventory (supply_chain.live_data.inventory)
# ─────────────────────────────────────────────
class InventoryItem(BaseModel):
    product_id: str
    product_name: Optional[str] = None
    warehouse_id: Optional[str] = None
    warehouse_name: Optional[str] = None
    available_quantity: Optional[int] = None
    opening_stock: Optional[int] = None
    closing_stock: Optional[int] = None
    daily_demand: Optional[int] = None
    maximum_stock: Optional[int] = None
    minimum_stock: Optional[int] = None
    reorder_point: Optional[int] = None
    safety_stock: Optional[int] = None
    stock_status: Optional[str] = None
    unit_cost: Optional[float] = None
    last_updated: Optional[Union[datetime, str]] = None


# ─────────────────────────────────────────────
# Analytics / KPIs
# ─────────────────────────────────────────────
class KPISummary(BaseModel):
    total_orders: int
    total_products: int
    pending_shipments: int
    low_stock_items: int


class TopProduct(BaseModel):
    product_id: str
    product_name: str
    total_quantity_ordered: int
    category: Optional[str] = None
