from contextlib import contextmanager
from typing import Generator

from databricks import sql

from config import settings


def get_connection():
    """Create a new Databricks SQL connection."""
    return sql.connect(
        server_hostname=settings.databricks_server_hostname,
        http_path=settings.databricks_http_path,
        access_token=settings.databricks_access_token,
    )


@contextmanager
def get_cursor() -> Generator:
    """
    Context manager that yields a Databricks cursor and ensures
    the connection is closed after use.
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        yield cursor
    finally:
        cursor.close()
        conn.close()


def qualified(table: str, schema: str = None) -> str:
    """Return a fully-qualified table name: catalog.schema.table"""
    s = schema or settings.databricks_schema
    return f"{settings.databricks_catalog}.{s}.{table}"

