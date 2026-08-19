from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query

from database import get_cursor, qualified
from gold_models import (
    DeliveryMLFeature,
    DeliveryPrediction,
    InventoryMLFeature,
    InventoryPrediction,
    ProcurementMLFeature,
    ProcurementPrediction,
)

router = APIRouter(prefix="/gold", tags=["Gold Schema - ML Features & Predictions"])


def fetch_all(query: str):
    """Utility to execute query and return list of dictionaries."""
    with get_cursor() as cursor:
        cursor.execute(query)
        if not cursor.description:
            return []
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()
        return [dict(zip(columns, row)) for row in rows]


def fetch_one(query: str):
    """Utility to execute query and return single dictionary."""
    with get_cursor() as cursor:
        cursor.execute(query)
        if not cursor.description:
            return None
        row = cursor.fetchone()
        if not row:
            return None
        columns = [col[0] for col in cursor.description]
        return dict(zip(columns, row))


# ─────────────────────────────────────────────
# Summary Endpoint
# ─────────────────────────────────────────────
@router.get("/summary", summary="Gold Schema Overview & ML Insights Summary")
def get_gold_summary():
    """Returns total record count and key problem highlights across all 6 Gold ML tables."""
    try:
        tables = [
            "delivery_ml_features",
            "delivery_predictions",
            "inventory_ml_features",
            "inventory_predictions",
            "procurement_ml_features",
            "procurement_predictions",
        ]
        counts = {}
        with get_cursor() as cursor:
            for tbl in tables:
                cursor.execute(f"SELECT COUNT(*) AS cnt FROM {qualified(tbl, schema='gold')}")
                res = cursor.fetchone()
                counts[tbl] = res[0] if res else 0

            # High risk counts
            cursor.execute(
                f"SELECT COUNT(*) FROM {qualified('delivery_predictions', schema='gold')} WHERE problem_detected = true"
            )
            delivery_problems = cursor.fetchone()[0]

            cursor.execute(
                f"SELECT COUNT(*) FROM {qualified('inventory_predictions', schema='gold')} WHERE problem_detected = true"
            )
            inventory_problems = cursor.fetchone()[0]

            cursor.execute(
                f"SELECT COUNT(*) FROM {qualified('procurement_predictions', schema='gold')} WHERE problem_detected = true"
            )
            procurement_problems = cursor.fetchone()[0]

        return {
            "status": "success",
            "catalog": qualified("").split(".")[0],
            "schema": "gold",
            "table_record_counts": counts,
            "detected_problems_summary": {
                "delivery_problems": delivery_problems,
                "inventory_problems": inventory_problems,
                "procurement_problems": procurement_problems,
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# 1. Delivery ML Features
# ─────────────────────────────────────────────
@router.get(
    "/delivery/features",
    response_model=List[DeliveryMLFeature],
    summary="List Delivery ML Features",
)
def list_delivery_ml_features(
    carrier_id: Optional[str] = Query(None, description="Filter by Carrier ID"),
    risk_level: Optional[str] = Query(None, description="Filter by Risk Level (e.g., HIGH, MEDIUM, LOW)"),
    is_delayed: Optional[bool] = Query(None, description="Filter by delayed status"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
):
    """Fetch feature records from `supply_chain.gold.delivery_ml_features`."""
    filters = ["1=1"]
    if carrier_id:
        filters.append(f"carrier_id = '{carrier_id}'")
    if risk_level:
        filters.append(f"risk_level = '{risk_level}'")
    if is_delayed is not None:
        filters.append(f"is_delayed = {str(is_delayed).lower()}")

    where_clause = " AND ".join(filters)
    query = f"""
        SELECT * FROM {qualified('delivery_ml_features', schema='gold')}
        WHERE {where_clause}
        LIMIT {limit} OFFSET {offset}
    """
    try:
        rows = fetch_all(query)
        return [DeliveryMLFeature(**r) for r in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/delivery/features/{shipment_id}",
    response_model=DeliveryMLFeature,
    summary="Get Delivery ML Feature by Shipment ID",
)
def get_delivery_ml_feature(shipment_id: str):
    """Fetch single feature record for a shipment from `supply_chain.gold.delivery_ml_features`."""
    query = f"""
        SELECT * FROM {qualified('delivery_ml_features', schema='gold')}
        WHERE shipment_id = '{shipment_id}'
    """
    try:
        data = fetch_one(query)
        if not data:
            raise HTTPException(status_code=404, detail=f"Delivery feature record for shipment '{shipment_id}' not found")
        return DeliveryMLFeature(**data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# 2. Delivery Predictions
# ─────────────────────────────────────────────
@router.get(
    "/delivery/predictions",
    response_model=List[DeliveryPrediction],
    summary="List Delivery Predictions",
)
def list_delivery_predictions(
    carrier_id: Optional[str] = Query(None, description="Filter by Carrier ID"),
    delay_risk: Optional[str] = Query(None, description="Filter by delay risk category"),
    problem_detected: Optional[bool] = Query(None, description="Filter by problem detected flag"),
    problem_severity: Optional[str] = Query(None, description="Filter by problem severity"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
):
    """Fetch prediction records from `supply_chain.gold.delivery_predictions`."""
    filters = ["1=1"]
    if carrier_id:
        filters.append(f"carrier_id = '{carrier_id}'")
    if delay_risk:
        filters.append(f"delay_risk = '{delay_risk}'")
    if problem_detected is not None:
        filters.append(f"problem_detected = {str(problem_detected).lower()}")
    if problem_severity:
        filters.append(f"problem_severity = '{problem_severity}'")

    where_clause = " AND ".join(filters)
    query = f"""
        SELECT * FROM {qualified('delivery_predictions', schema='gold')}
        WHERE {where_clause}
        LIMIT {limit} OFFSET {offset}
    """
    try:
        rows = fetch_all(query)
        return [DeliveryPrediction(**r) for r in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/delivery/predictions/{shipment_id}",
    response_model=DeliveryPrediction,
    summary="Get Delivery Prediction by Shipment ID",
)
def get_delivery_prediction(shipment_id: str):
    """Fetch prediction record for a shipment from `supply_chain.gold.delivery_predictions`."""
    query = f"""
        SELECT * FROM {qualified('delivery_predictions', schema='gold')}
        WHERE shipment_id = '{shipment_id}'
    """
    try:
        data = fetch_one(query)
        if not data:
            raise HTTPException(status_code=404, detail=f"Delivery prediction for shipment '{shipment_id}' not found")
        return DeliveryPrediction(**data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# 3. Inventory ML Features
# ─────────────────────────────────────────────
@router.get(
    "/inventory/features",
    response_model=List[InventoryMLFeature],
    summary="List Inventory ML Features",
)
def list_inventory_ml_features(
    product_id: Optional[str] = Query(None, description="Filter by Product ID"),
    warehouse_id: Optional[str] = Query(None, description="Filter by Warehouse ID"),
    stock_status_prediction: Optional[str] = Query(None, description="Filter by predicted stock status"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
):
    """Fetch feature records from `supply_chain.gold.inventory_ml_features`."""
    filters = ["1=1"]
    if product_id:
        filters.append(f"product_id = '{product_id}'")
    if warehouse_id:
        filters.append(f"warehouse_id = '{warehouse_id}'")
    if stock_status_prediction:
        filters.append(f"stock_status_prediction = '{stock_status_prediction}'")

    where_clause = " AND ".join(filters)
    query = f"""
        SELECT * FROM {qualified('inventory_ml_features', schema='gold')}
        WHERE {where_clause}
        LIMIT {limit} OFFSET {offset}
    """
    try:
        rows = fetch_all(query)
        return [InventoryMLFeature(**r) for r in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/inventory/features/{product_id}/{warehouse_id}",
    response_model=InventoryMLFeature,
    summary="Get Inventory ML Feature by Product & Warehouse ID",
)
def get_inventory_ml_feature(product_id: str, warehouse_id: str):
    """Fetch inventory feature record from `supply_chain.gold.inventory_ml_features`."""
    query = f"""
        SELECT * FROM {qualified('inventory_ml_features', schema='gold')}
        WHERE product_id = '{product_id}' AND warehouse_id = '{warehouse_id}'
    """
    try:
        data = fetch_one(query)
        if not data:
            raise HTTPException(
                status_code=404,
                detail=f"Inventory feature record for product '{product_id}' in warehouse '{warehouse_id}' not found",
            )
        return InventoryMLFeature(**data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# 4. Inventory Predictions
# ─────────────────────────────────────────────
@router.get(
    "/inventory/predictions",
    response_model=List[InventoryPrediction],
    summary="List Inventory Predictions",
)
def list_inventory_predictions(
    product_id: Optional[str] = Query(None, description="Filter by Product ID"),
    warehouse_id: Optional[str] = Query(None, description="Filter by Warehouse ID"),
    predicted_stock_status: Optional[str] = Query(None, description="Filter by predicted stock status"),
    problem_detected: Optional[bool] = Query(None, description="Filter by problem detected flag"),
    action_priority: Optional[str] = Query(None, description="Filter by action priority"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
):
    """Fetch prediction records from `supply_chain.gold.inventory_predictions`."""
    filters = ["1=1"]
    if product_id:
        filters.append(f"product_id = '{product_id}'")
    if warehouse_id:
        filters.append(f"warehouse_id = '{warehouse_id}'")
    if predicted_stock_status:
        filters.append(f"predicted_stock_status = '{predicted_stock_status}'")
    if problem_detected is not None:
        filters.append(f"problem_detected = {str(problem_detected).lower()}")
    if action_priority:
        filters.append(f"action_priority = '{action_priority}'")

    where_clause = " AND ".join(filters)
    query = f"""
        SELECT * FROM {qualified('inventory_predictions', schema='gold')}
        WHERE {where_clause}
        LIMIT {limit} OFFSET {offset}
    """
    try:
        rows = fetch_all(query)
        return [InventoryPrediction(**r) for r in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/inventory/predictions/{product_id}/{warehouse_id}",
    response_model=InventoryPrediction,
    summary="Get Inventory Prediction by Product & Warehouse ID",
)
def get_inventory_prediction(product_id: str, warehouse_id: str):
    """Fetch inventory prediction record from `supply_chain.gold.inventory_predictions`."""
    query = f"""
        SELECT * FROM {qualified('inventory_predictions', schema='gold')}
        WHERE product_id = '{product_id}' AND warehouse_id = '{warehouse_id}'
    """
    try:
        data = fetch_one(query)
        if not data:
            raise HTTPException(
                status_code=404,
                detail=f"Inventory prediction for product '{product_id}' in warehouse '{warehouse_id}' not found",
            )
        return InventoryPrediction(**data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# 5. Procurement ML Features
# ─────────────────────────────────────────────
@router.get(
    "/procurement/features",
    response_model=List[ProcurementMLFeature],
    summary="List Procurement ML Features",
)
def list_procurement_ml_features(
    carrier_id: Optional[str] = Query(None, description="Filter by Carrier ID"),
    product_id: Optional[str] = Query(None, description="Filter by Product ID"),
    warehouse_id: Optional[str] = Query(None, description="Filter by Warehouse ID"),
    supplier_risk_category: Optional[str] = Query(None, description="Filter by risk category"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
):
    """Fetch feature records from `supply_chain.gold.procurement_ml_features`."""
    filters = ["1=1"]
    if carrier_id:
        filters.append(f"carrier_id = '{carrier_id}'")
    if product_id:
        filters.append(f"product_id = '{product_id}'")
    if warehouse_id:
        filters.append(f"warehouse_id = '{warehouse_id}'")
    if supplier_risk_category:
        filters.append(f"supplier_risk_category = '{supplier_risk_category}'")

    where_clause = " AND ".join(filters)
    query = f"""
        SELECT * FROM {qualified('procurement_ml_features', schema='gold')}
        WHERE {where_clause}
        LIMIT {limit} OFFSET {offset}
    """
    try:
        rows = fetch_all(query)
        return [ProcurementMLFeature(**r) for r in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/procurement/features/{carrier_id}/{product_id}/{warehouse_id}",
    response_model=ProcurementMLFeature,
    summary="Get Procurement ML Feature by Carrier, Product & Warehouse ID",
)
def get_procurement_ml_feature(carrier_id: str, product_id: str, warehouse_id: str):
    """Fetch procurement feature record from `supply_chain.gold.procurement_ml_features`."""
    query = f"""
        SELECT * FROM {qualified('procurement_ml_features', schema='gold')}
        WHERE carrier_id = '{carrier_id}' AND product_id = '{product_id}' AND warehouse_id = '{warehouse_id}'
    """
    try:
        data = fetch_one(query)
        if not data:
            raise HTTPException(
                status_code=404,
                detail=f"Procurement feature record for carrier '{carrier_id}', product '{product_id}', warehouse '{warehouse_id}' not found",
            )
        return ProcurementMLFeature(**data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# 6. Procurement Predictions
# ─────────────────────────────────────────────
@router.get(
    "/procurement/predictions",
    response_model=List[ProcurementPrediction],
    summary="List Procurement Predictions",
)
def list_procurement_predictions(
    carrier_id: Optional[str] = Query(None, description="Filter by Carrier ID"),
    product_id: Optional[str] = Query(None, description="Filter by Product ID"),
    warehouse_id: Optional[str] = Query(None, description="Filter by Warehouse ID"),
    risk_category: Optional[str] = Query(None, description="Filter by risk category"),
    problem_detected: Optional[bool] = Query(None, description="Filter by problem detected flag"),
    alternative_supplier_recommended: Optional[bool] = Query(None, description="Filter by alternative supplier recommended"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
):
    """Fetch prediction records from `supply_chain.gold.procurement_predictions`."""
    filters = ["1=1"]
    if carrier_id:
        filters.append(f"carrier_id = '{carrier_id}'")
    if product_id:
        filters.append(f"product_id = '{product_id}'")
    if warehouse_id:
        filters.append(f"warehouse_id = '{warehouse_id}'")
    if risk_category:
        filters.append(f"risk_category = '{risk_category}'")
    if problem_detected is not None:
        filters.append(f"problem_detected = {str(problem_detected).lower()}")
    if alternative_supplier_recommended is not None:
        filters.append(f"alternative_supplier_recommended = {str(alternative_supplier_recommended).lower()}")

    where_clause = " AND ".join(filters)
    query = f"""
        SELECT * FROM {qualified('procurement_predictions', schema='gold')}
        WHERE {where_clause}
        LIMIT {limit} OFFSET {offset}
    """
    try:
        rows = fetch_all(query)
        return [ProcurementPrediction(**r) for r in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/procurement/predictions/{carrier_id}/{product_id}/{warehouse_id}",
    response_model=ProcurementPrediction,
    summary="Get Procurement Prediction by Carrier, Product & Warehouse ID",
)
def get_procurement_prediction(carrier_id: str, product_id: str, warehouse_id: str):
    """Fetch procurement prediction record from `supply_chain.gold.procurement_predictions`."""
    query = f"""
        SELECT * FROM {qualified('procurement_predictions', schema='gold')}
        WHERE carrier_id = '{carrier_id}' AND product_id = '{product_id}' AND warehouse_id = '{warehouse_id}'
    """
    try:
        data = fetch_one(query)
        if not data:
            raise HTTPException(
                status_code=404,
                detail=f"Procurement prediction for carrier '{carrier_id}', product '{product_id}', warehouse '{warehouse_id}' not found",
            )
        return ProcurementPrediction(**data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
