from typing import List

from fastapi import APIRouter, HTTPException, Query

from database import get_cursor, qualified
from models import KPISummary, TopProduct

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/kpis", response_model=KPISummary, summary="Overall KPI summary")
def get_kpis():
    """
    Return high-level KPIs from live_data tables:
    - Total orders
    - Total products
    - Pending shipments
    - Low-stock item count
    """
    try:
        with get_cursor() as cursor:
            # Orders KPI
            cursor.execute(f"SELECT COUNT(*) FROM {qualified('orders', schema='live_data')}")
            total_orders = cursor.fetchone()[0]

            # Products KPI
            cursor.execute(f"SELECT COUNT(*) FROM {qualified('product_master', schema='live_data')}")
            total_products = cursor.fetchone()[0]

            # Pending shipments KPI
            cursor.execute(
                f"SELECT COUNT(*) FROM {qualified('shipments', schema='live_data')} WHERE shipment_status IN ('IN_TRANSIT', 'PENDING', 'PROCESSING')"
            )
            pending_shipments = cursor.fetchone()[0]

            # Low stock items KPI
            cursor.execute(
                f"SELECT COUNT(*) FROM {qualified('inventory', schema='live_data')} WHERE available_quantity <= reorder_point OR stock_status = 'LOW_STOCK'"
            )
            low_stock_items = cursor.fetchone()[0]

            return KPISummary(
                total_orders=int(total_orders or 0),
                total_products=int(total_products or 0),
                pending_shipments=int(pending_shipments or 0),
                low_stock_items=int(low_stock_items or 0),
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/top-products", response_model=List[TopProduct], summary="Top-ordered products")
def top_products(
    limit: int = Query(10, ge=1, le=50, description="Number of top products to return"),
):
    """Return the top N products by total ordered quantity."""
    query = f"""
        SELECT o.product_id,
               COALESCE(p.product_name, o.product_id) AS product_name,
               SUM(o.ordered_quantity) AS total_quantity_ordered,
               MAX(p.category) AS category
        FROM {qualified('orders', schema='live_data')} o
        LEFT JOIN {qualified('product_master', schema='live_data')} p ON o.product_id = p.product_id
        GROUP BY o.product_id, p.product_name
        ORDER BY total_quantity_ordered DESC
        LIMIT {limit}
    """
    try:
        with get_cursor() as cursor:
            cursor.execute(query)
            rows = cursor.fetchall()
            return [
                TopProduct(
                    product_id=r[0],
                    product_name=r[1],
                    total_quantity_ordered=int(r[2] or 0),
                    category=r[3],
                )
                for r in rows
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
