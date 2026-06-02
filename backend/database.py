from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url,
                       connect_args={"check_same_thread":False} 
                       )
SessionLocal=sessionmaker(bind=engine)

Base=declarative_base()

