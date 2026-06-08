from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql+psycopg://localhost:5432/holdview"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind = engine)
