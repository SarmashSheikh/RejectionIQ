import sys
import os

# Add the current directory to sys.path so we can import from database
sys.path.append(os.getcwd())

from sqlalchemy import create_engine, text, inspect
from database.database import settings

def fix_schema():
    print(f"Connecting to {settings.DATABASE_URL}...")
    engine = create_engine(settings.DATABASE_URL)
    inspector = inspect(engine)
    
    with engine.connect() as conn:
        print("Checking rejections table schema...")
        columns = [col["name"] for col in inspector.get_columns("rejections")]
        
        # Check for 'status' column
        if 'status' not in columns:
            print("Adding 'status' column to rejections table...")
            conn.execute(text("ALTER TABLE rejections ADD COLUMN status VARCHAR(50) DEFAULT 'pending'"))
            print("'status' column added.")
        else:
            print("'status' column already exists.")

        # Check for 'diagnosis_data' column
        if 'diagnosis_data' not in columns:
            print("Adding 'diagnosis_data' column to rejections table...")
            col_type = "JSONB" if "postgresql" in settings.DATABASE_URL else "TEXT"
            conn.execute(text(f"ALTER TABLE rejections ADD COLUMN diagnosis_data {col_type}"))
            print("'diagnosis_data' column added.")
        else:
            print("'diagnosis_data' column already exists.")
            
        conn.commit()
        print("Schema update complete.")

if __name__ == "__main__":
    fix_schema()
