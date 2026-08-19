from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Databricks connection
    databricks_server_hostname: str
    databricks_http_path: str
    databricks_access_token: str
    databricks_catalog: str = "main"
    databricks_schema: str = "supply_chain"

    # App
    app_env: str = "development"
    app_port: int = 8000


settings = Settings()
