from database.db import engine, Base
from database.models import AgentConfig, AgentState, Roadmap

# This will create the new tables
print("Creating new agent tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")
