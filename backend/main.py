"""
Supply Chain FastAPI Backend
Connects to Databricks SQL Warehouse and exposes REST APIs
for Orders, Products, Suppliers, Shipments, Inventory, and Analytics.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import analytics, gold, inventory, orders, products, shipments, suppliers

# ─────────────────────────────────────────────
# App Initialization
# ─────────────────────────────────────────────
app = FastAPI(
    title="Supply Chain API",
    description=(
        "REST API for Supply Chain data powered by **Databricks SQL**. "
        "Provides endpoints for Orders, Products, Suppliers, Shipments, "
        "Inventory, Analytics, and Gold ML Features/Predictions."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─────────────────────────────────────────────
# CORS (adjust origins for production)
# ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Routers
# ─────────────────────────────────────────────
app.include_router(orders.router,    prefix="/api/v1")
app.include_router(products.router,  prefix="/api/v1")
app.include_router(suppliers.router, prefix="/api/v1")
app.include_router(shipments.router, prefix="/api/v1")
app.include_router(inventory.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(gold.router,      prefix="/api/v1")



# ─────────────────────────────────────────────
# Health check
# ─────────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health_check():
    """Returns service health status."""
    return {
        "status": "ok",
        "environment": settings.app_env,
        "databricks_host": settings.databricks_server_hostname,
        "catalog": settings.databricks_catalog,
        "schema": settings.databricks_schema,
    }


@app.get("/", tags=["Root"])
def root():
    """API root — redirects you to the docs."""
    return {
        "message": "Supply Chain API is running.",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
    }
