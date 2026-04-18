import sqlite3
import os

def update_database():
    db_path = "eduverse.db"
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(students)")
        columns = [column[1] for column in cursor.fetchall()]

        if "backup_email" not in columns:
            print("Adding backup_email column...")
            cursor.execute("ALTER TABLE students ADD COLUMN backup_email TEXT")
        else:
            print("backup_email column already exists.")

        if "notifications_enabled" not in columns:
            print("Adding notifications_enabled column...")
            cursor.execute("ALTER TABLE students ADD COLUMN notifications_enabled BOOLEAN DEFAULT 1")
        else:
            print("notifications_enabled column already exists.")

        conn.commit()
        print("Database updated successfully!")
    except Exception as e:
        print(f"Error updating database: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    update_database()
