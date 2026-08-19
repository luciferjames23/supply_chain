import sys
from config import settings
import database


def test_connection():
    print(f"Connecting to Databricks host: {settings.databricks_server_hostname}...")
    try:
        conn = database.get_connection()
        cursor = conn.cursor()

        # Test basic query
        cursor.execute("SELECT 1 AS status")
        result = cursor.fetchone()
        print(f"[OK] Basic Query Test: SUCCESS (Result: {result})")

        # Test catalog query
        cursor.execute(f"USE CATALOG {settings.databricks_catalog}")
        print(f"[OK] Catalog Selected: {settings.databricks_catalog}")

        # List schemas
        cursor.execute("SHOW SCHEMAS")
        schemas = [row.databaseName for row in cursor.fetchall()]
        print(f"[OK] Available Schemas in '{settings.databricks_catalog}': {', '.join(schemas)}")

        cursor.close()
        conn.close()
        print("\nDatabricks connection test passed successfully!")
    except Exception as e:
        print(f"\n[ERROR] Connection failed: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    test_connection()
