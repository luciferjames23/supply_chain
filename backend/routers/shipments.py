from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query

from database import get_cursor, qualified
from models import Shipment

router = APIRouter(prefix="/shipments", tags=["Shipments"])


@router.get("/", response_model=List[Shipment], summary="List all shipments")
def list_shipments(
    shipment_status: Optional[str] = Query(None, description="Filter by shipment status"),
    carrier_id: Optional[str] = Query(None, description="Filter by carrier ID"),
    order_id: Optional[str] = Query(None, description="Filter by order ID"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
):
    """Retrieve shipment records from `supply_chain.live_data.shipments`."""
    filters = ["1=1"]
    if shipment_status:
        filters.append(f"shipment_status = '{shipment_status}'")
    if carrier_id:
        filters.append(f"carrier_id = '{carrier_id}'")
    if order_id:
        filters.append(f"order_id = '{order_id}'")

    where_clause = " AND ".join(filters)
    query = f"""
        SELECT * FROM {qualified('shipments', schema='live_data')}
        WHERE {where_clause}
        ORDER BY created_at DESC
        LIMIT {limit} OFFSET {offset}
    """
    try:
        with get_cursor() as cursor:
            cursor.execute(query)
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
            return [Shipment(**dict(zip(columns, row))) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{shipment_id}", response_model=Shipment, summary="Get shipment by ID")
def get_shipment(shipment_id: str):
    """Retrieve a single shipment by its ID from `supply_chain.live_data.shipments`."""
    query = f"""
        SELECT * FROM {qualified('shipments', schema='live_data')}
        WHERE shipment_id = '{shipment_id}'
    """
    try:
        with get_cursor() as cursor:
            cursor.execute(query)
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail=f"Shipment '{shipment_id}' not found")
            columns = [col[0] for col in cursor.description]
            return Shipment(**dict(zip(columns, row)))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
