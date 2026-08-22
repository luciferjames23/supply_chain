from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query

from database import get_cursor, qualified
from models import Product

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/", response_model=List[Product], summary="List all products")
def list_products(
    category: Optional[str] = Query(None, description="Filter by product category"),
    supplier_id: Optional[str] = Query(None, description="Filter by supplier ID"),
    limit: int = Query(10000, ge=1, le=100000),
    offset: int = Query(0, ge=0),
):
    """Retrieve product catalogue from `supply_chain.live_data.product_master`."""
    filters = ["1=1"]
    if category:
        filters.append(f"category = '{category}'")
    if supplier_id:
        filters.append(f"supplier_id = '{supplier_id}'")

    where_clause = " AND ".join(filters)
    query = f"""
        SELECT * FROM {qualified('product_master', schema='live_data')}
        WHERE {where_clause}
        ORDER BY product_name
        LIMIT {limit} OFFSET {offset}
    """
    try:
        with get_cursor() as cursor:
            cursor.execute(query)
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
            return [Product(**dict(zip(columns, row))) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{product_id}", response_model=Product, summary="Get product by ID")
def get_product(product_id: str):
    """Retrieve a single product by its ID from `supply_chain.live_data.product_master`."""
    query = f"""
        SELECT * FROM {qualified('product_master', schema='live_data')}
        WHERE product_id = '{product_id}'
    """
    try:
        with get_cursor() as cursor:
            cursor.execute(query)
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found")
            columns = [col[0] for col in cursor.description]
            return Product(**dict(zip(columns, row)))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
