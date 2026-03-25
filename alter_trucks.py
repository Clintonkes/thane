import os
import sys
from pathlib import Path

# Add the project root to Python path
PROJECT_ROOT = Path(__file__).parent
sys.path.insert(0, str(PROJECT_ROOT))

from database.connection import engine
from sqlalchemy import text

def alter_table():
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE trucks ALTER COLUMN image_url TYPE text;"))
            conn.commit()
            print("Successfully altered trucks table.")
    except Exception as e:
        print(f"Error altering table: {e}")

if __name__ == "__main__":
    alter_table()
