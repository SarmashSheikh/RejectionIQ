import sys
import os

# Add the current directory to sys.path so we can import from database
sys.path.append(os.getcwd())

from sqlalchemy import create_engine, text
from database.database import settings

def fix_schema():
    print(f"Connecting to {settings.DATABASE_URL}...")
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        print("Checking rejections table schema...")
        
        # Check for 'status' column
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='rejections' AND column_name='status'"))
        if not result.fetchone():
            print("Adding 'status' column to rejections table...")
            conn.execute(text("ALTER TABLE rejections ADD COLUMN status VARCHAR(50) DEFAULT 'pending'"))
            print("'status' column added.")
        else:
            print("'status' column already exists.")

        # Check for 'diagnosis_data' column
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='rejections' AND column_name='diagnosis_data'"))
        if not result.fetchone():
            print("Adding 'diagnosis_data' column to rejections table...")
            conn.execute(text("ALTER TABLE rejections ADD COLUMN diagnosis_data JSONB"))
            print("'diagnosis_data' column added.")
        else:
            print("'diagnosis_data' column already exists.")
            
        conn.commit()
        print("Schema update complete.")

if __name__ == "__main__":
    fix_schema()
