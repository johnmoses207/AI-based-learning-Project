import sqlite3

def manage_admin(email):
    conn = sqlite3.connect('eduverse.db')
    cursor = conn.cursor()
    
    # Check if user exists
    cursor.execute("SELECT email, role FROM students WHERE email = ?", (email,))
    user = cursor.fetchone()
    
    if user:
        print(f"Found user: {user}")
        if user[1] == 'admin':
            print("User is already ADMIN.")
        else:
            print("Promoting to ADMIN...")
            cursor.execute("UPDATE students SET role = 'admin' WHERE email = ?", (email,))
            print("Success.")
    else:
        print("User not found. Creating user as ADMIN...")
        # Create user with null password/google_id for now, they can link it later via Google Login
        cursor.execute("INSERT INTO students (email, role, google_id) VALUES (?, 'admin', 'placeholder')", (email,))
        print("Success: Created new Admin user.")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    manage_admin('kiranbabub18@gmail.com')
