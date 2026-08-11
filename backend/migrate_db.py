import sqlite3
import os

def migrate():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, 'rejectioniq.db')
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    # Rejections table
    cols = [col[1] for col in c.execute('PRAGMA table_info(rejections)').fetchall()]
    print('Existing rejections cols:', cols)
    missing_rejs = [
        ('status', 'TEXT DEFAULT "pending"'),
        ('diagnosis_data', 'TEXT'),
        ('company_type', 'TEXT DEFAULT "Product Based"'),
        ('selected_round', 'TEXT')
    ]
    for col_name, col_type in missing_rejs:
        if col_name not in cols:
            c.execute(f'ALTER TABLE rejections ADD COLUMN {col_name} {col_type}')
            print(f'Added {col_name} to rejections')

    # Users table
    user_cols = [col[1] for col in c.execute('PRAGMA table_info(users)').fetchall()]
    print('Existing users cols:', user_cols)
    missing_users = [
        ('is_verified', 'BOOLEAN DEFAULT 0'),
        ('otp', 'VARCHAR(6)'),
        ('otp_expires_at', 'DATETIME'),
        ('dream_company', 'VARCHAR(100) DEFAULT "Google"'),
        ('dream_cgpa', 'FLOAT DEFAULT 8.5'),
        ('dream_internships', 'INTEGER DEFAULT 2'),
        ('dream_projects', 'INTEGER DEFAULT 3'),
        ('dream_skills', 'TEXT DEFAULT "[]"')
    ]
    for col_name, col_type in missing_users:
        if col_name not in user_cols:
            c.execute(f'ALTER TABLE users ADD COLUMN {col_name} {col_type}')
            print(f'Added {col_name} to users')

    conn.commit()
    conn.close()
    print("Migration complete!")

if __name__ == '__main__':
    migrate()
