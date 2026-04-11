from database.db import engine, Base
from database.models import Resource

print("Migrating Resources table...")
Base.metadata.create_all(bind=engine)
print("Migration Complete.")
