from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, JSON, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True) # T10: Arama için indekslendi
    tax_number = Column(String, unique=True, index=True)
    # T2: CRUD işlemleri için gerekli diğer alanlar...

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String) # "ADMIN" veya "USER" (T1: RBAC için)[cite: 1]

class FinancialReport(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    ai_analysis = Column(String) # T4: AI Analiz raporu[cite: 1]
    raw_data = Column(JSON) # T3: OCR'dan gelen veriler[cite: 1]