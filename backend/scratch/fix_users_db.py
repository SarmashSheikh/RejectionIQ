import sys
import os

# Add the current directory to sys.path so we can import from database
sys.path.append(os.getcwd())

from sqlalchemy import create_engine, text, inspect
from database.database import settings

def check_users_schema():
    print(f"Connecting to {settings.DATABASE_URL}...")
    engine = create_engine(settings.DATABASE_URL)
    inspector = inspect(engine)
    
    with engine.connect() as conn:
        print("Checking users table schema...")
        existing_cols = [col["name"] for col in inspector.get_columns("users")]
        columns_to_check = [
            ('skills', 'JSON' if 'sqlite' in settings.DATABASE_URL else 'VARCHAR[]'),
            ('target_companies', 'JSON' if 'sqlite' in settings.DATABASE_URL else 'VARCHAR[]'),
            ('target_roles', 'JSON' if 'sqlite' in settings.DATABASE_URL else 'VARCHAR[]')
        ]
        
        for col_name, col_type in columns_to_check:
            if col_name not in existing_cols:
                print(f"Adding '{col_name}' column to users table...")
                default_val = "'[]'" if 'sqlite' in settings.DATABASE_URL else "'{}'"
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type} DEFAULT {default_val}"))
                print(f"'{col_name}' column added.")
            else:
                print(f"'{col_name}' column already exists.")

        conn.commit()
        print("User table check complete.")

if __name__ == "__main__":
    check_users_schema()
