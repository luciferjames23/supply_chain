from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query

from database import get_cursor, qualified
from models import Order

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("/", response_model=List[Order], summary="List all orders")
def list_orders(
    status: Optional[str] = Query(None, description="Filter by order status (e.g., DELIVERED, PENDING, SHIPPED)"),
    priority: Optional[str] = Query(None, description="Filter by priority (e.g., HIGH, MEDIUM, LOW)"),
    warehouse_id: Optional[str] = Query(None, description="Filter by warehouse ID"),
    limit: int = Query(10000, ge=1, le=100000, description="Max records to return"),
    offset: int = Query(0, ge=0, description="Number of records to skip"),
):
    """Retrieve supply chain orders from `supply_chain.live_data.orders`."""
    filters = ["1=1"]
    if status:
        filters.append(f"order_status = '{status}'")
    if priority:
        filters.append(f"priority = '{priority}'")
    if warehouse_id:
        filters.append(f"warehouse_id = '{warehouse_id}'")

    where_clause = " AND ".join(filters)
    query = f"""
        SELECT * FROM {qualified('orders', schema='live_data')}
        WHERE {where_clause}
        ORDER BY order_date DESC
        LIMIT {limit} OFFSET {offset}
    """
    try:
        with get_cursor() as cursor:
            cursor.execute(query)
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
            return [Order(**dict(zip(columns, row))) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{order_id}", response_model=Order, summary="Get order by ID")
def get_order(order_id: str):
    """Retrieve a single order by its ID from `supply_chain.live_data.orders`."""
    query = f"""
        SELECT * FROM {qualified('orders', schema='live_data')}
        WHERE order_id = '{order_id}'
    """
    try:
        with get_cursor() as cursor:
            cursor.execute(query)
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
            columns = [col[0] for col in cursor.description]
            return Order(**dict(zip(columns, row)))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
