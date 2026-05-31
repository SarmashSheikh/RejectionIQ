import sys
import os

# Add the current directory to sys.path so we can import from database
sys.path.append(os.getcwd())

from sqlalchemy import create_engine, text
from database.database import settings

def check_users_schema():
    print(f"Connecting to {settings.DATABASE_URL}...")
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        print("Checking users table schema...")
        columns_to_check = [
            ('skills', 'VARCHAR[]'),
            ('target_companies', 'VARCHAR[]'),
            ('target_roles', 'VARCHAR[]')
        ]
        
        for col_name, col_type in columns_to_check:
            result = conn.execute(text(f"SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='{col_name}'"))
            if not result.fetchone():
                print(f"Adding '{col_name}' column to users table...")
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type} DEFAULT '{{}}'"))
                print(f"'{col_name}' column added.")
            else:
                print(f"'{col_name}' column already exists.")

        conn.commit()
        print("User table check complete.")

if __name__ == "__main__":
    check_users_schema()
