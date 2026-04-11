from database.db import SessionLocal
from database.models import Student

def cleanup_users():
    db = SessionLocal()
    try:
        # Delete all students who are NOT admins
        deleted_count = db.query(Student).filter(Student.role != 'admin').delete()
        db.commit()
        print(f"Successfully deleted {deleted_count} student accounts.")
        
        # List remaining admins
        admins = db.query(Student).all()
        print("Remaining Admins:")
        for admin in admins:
            print(f"- {admin.email} (ID: {admin.id})")
            
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    cleanup_users()
