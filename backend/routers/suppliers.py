from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query

from database import get_cursor, qualified
from models import Supplier

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])


@router.get("/", response_model=List[Supplier], summary="List all suppliers")
def list_suppliers(
    country: Optional[str] = Query(None, description="Filter by country"),
    active_status: Optional[str] = Query(None, description="Filter by active status (e.g. Active, Inactive)"),
    limit: int = Query(10000, ge=1, le=100000),
    offset: int = Query(0, ge=0),
):
    """Retrieve supplier master data from `supply_chain.live_data.supplier_master`."""
    filters = ["1=1"]
    if country:
        filters.append(f"country = '{country}'")
    if active_status:
        filters.append(f"active_status = '{active_status}'")

    where_clause = " AND ".join(filters)
    query = f"""
        SELECT * FROM {qualified('supplier_master', schema='live_data')}
        WHERE {where_clause}
        ORDER BY supplier_name
        LIMIT {limit} OFFSET {offset}
    """
    try:
        with get_cursor() as cursor:
            cursor.execute(query)
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
            return [Supplier(**dict(zip(columns, row))) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{supplier_id}", response_model=Supplier, summary="Get supplier by ID")
def get_supplier(supplier_id: str):
    """Retrieve a single supplier by its ID from `supply_chain.live_data.supplier_master`."""
    query = f"""
        SELECT * FROM {qualified('supplier_master', schema='live_data')}
        WHERE supplier_id = '{supplier_id}'
    """
    try:
        with get_cursor() as cursor:
            cursor.execute(query)
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail=f"Supplier '{supplier_id}' not found")
            columns = [col[0] for col in cursor.description]
            return Supplier(**dict(zip(columns, row)))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
