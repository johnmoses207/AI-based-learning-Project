import sqlite3

def migrate():
    conn = sqlite3.connect('eduverse.db')
    cursor = conn.cursor()
    
    try:
        # Check if role column exists
        cursor.execute("SELECT role FROM students LIMIT 1")
    except sqlite3.OperationalError:
        # If not, add it
        print("Adding role column...")
        cursor.execute("ALTER TABLE students ADD COLUMN role TEXT DEFAULT 'student'")
        cursor.execute("UPDATE students SET role = 'student' WHERE role IS NULL")
        print("Role column added and defaults set.")
    except Exception as e:
        print(f"Error: {e}")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate()
