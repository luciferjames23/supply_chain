from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query

from database import get_cursor, qualified
from models import InventoryItem

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("/", response_model=List[InventoryItem], summary="List inventory")
def list_inventory(
    warehouse_id: Optional[str] = Query(None, description="Filter by warehouse ID"),
    stock_status: Optional[str] = Query(None, description="Filter by stock status (e.g. LOW_STOCK, OPTIMAL, OVERSTOCK)"),
    product_id: Optional[str] = Query(None, description="Filter by product ID"),
    limit: int = Query(10000, ge=1, le=100000),
    offset: int = Query(0, ge=0),
):
    """Retrieve current inventory levels from `supply_chain.live_data.inventory`."""
    filters = ["1=1"]
    if warehouse_id:
        filters.append(f"warehouse_id = '{warehouse_id}'")
    if stock_status:
        filters.append(f"stock_status = '{stock_status}'")
    if product_id:
        filters.append(f"product_id = '{product_id}'")

    where_clause = " AND ".join(filters)
    query = f"""
        SELECT * FROM {qualified('inventory', schema='live_data')}
        WHERE {where_clause}
        ORDER BY product_id
        LIMIT {limit} OFFSET {offset}
    """
    try:
        with get_cursor() as cursor:
            cursor.execute(query)
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
            return [InventoryItem(**dict(zip(columns, row))) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
