import sqlite3

def migrate():
    conn = sqlite3.connect('eduverse.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE students ADD COLUMN google_id TEXT")
        print("Added google_id column")
    except Exception as e:
        print(f"Skipping google_id: {e}")

    try:
        cursor.execute("ALTER TABLE students ADD COLUMN avatar TEXT")
        print("Added avatar column")
    except Exception as e:
        print(f"Skipping avatar: {e}")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate()
