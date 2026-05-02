from sqlalchemy import create_engine, Column, Integer, String, Float, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

DATABASE_URL = "sqlite:///./fintech.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    name = Column(String)
    role = Column(String)  # "admin" or "user"
    company_id = Column(String, nullable=True)
    approval_status = Column(String, default="approved")  # "approved" | "pending" | "rejected"
    unlocked_features = Column(JSON, default=list)


class Company(Base):
    __tablename__ = "companies"
    id = Column(String, primary_key=True)
    name = Column(String, index=True)
    tax_no = Column(String, unique=True, index=True)
    trade_registry_no = Column(String, nullable=True)
    sector = Column(String, nullable=True)
    contact_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    address = Column(String, nullable=True)
    group = Column(String, nullable=True)
    contract_type = Column(String, nullable=True)
    contract_value = Column(Float, nullable=True)
    contract_start = Column(String, nullable=True)
    contract_end = Column(String, nullable=True)
    status = Column(String, default="Aktif")
    score = Column(Integer, default=65)
    estimated_turnover = Column(Float, nullable=True)
    actual_turnover = Column(Float, nullable=True)
    founded_at = Column(String, nullable=True)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())


class PendingCompany(Base):
    __tablename__ = "pending_companies"
    id = Column(String, primary_key=True)
    name = Column(String)
    contact_name = Column(String)
    email = Column(String)
    tax_no = Column(String, nullable=True)
    status = Column(String, default="Bekliyor")
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())


class Group(Base):
    __tablename__ = "groups"
    id = Column(String, primary_key=True)
    name = Column(String)
    company_count = Column(Integer, default=0)
    turnover = Column(Float, default=0)
    debt = Column(Float, default=0)
    risk_score = Column(Integer, default=55)


class FinancialReport(Base):
    __tablename__ = "financial_reports"
    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(String, ForeignKey("companies.id"))
    ai_analysis = Column(String, nullable=True)
    raw_data = Column(JSON, nullable=True)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())


class Contract(Base):
    __tablename__ = "contracts"
    id = Column(String, primary_key=True)
    company = Column(String)
    type = Column(String)
    start = Column(String)
    end = Column(String)
    value = Column(Float)
    status = Column(String)


class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(String, primary_key=True)
    company = Column(String)
    plan = Column(String)
    price = Column(Float)
    next_payment = Column(String)
    status = Column(String)


class FinancialProcess(Base):
    __tablename__ = "financial_process"
    id = Column(String, primary_key=True)
    company = Column(String)
    amount = Column(Float)
    type = Column(String)
    status = Column(String)
    paid_at = Column(String)


class PremiumRequest(Base):
    __tablename__ = "premium_requests"
    id = Column(String, primary_key=True)
    company = Column(String)
    contact = Column(String)
    requested_at = Column(String)
    status = Column(String, default="Bekliyor")
    reason = Column(String, nullable=True)


class Log(Base):
    __tablename__ = "logs"
    id = Column(String, primary_key=True)
    action = Column(String)
    type = Column(String)
    status = Column(String, default="success")
    detail = Column(JSON, nullable=True)
    user = Column(String)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())


def seed_data(db):
    if db.query(User).first():
        return

    db.add_all([
        User(id=1, email="admin@prosicht.com", password="admin123", name="Admin", role="admin"),
        User(id=2, email="user@firma.com", password="user123", name="Kullanıcı", role="user", company_id="cmp-001"),
    ])

    db.add_all([
        Company(id="cmp-001", name="Yıldız Holding A.Ş.", tax_no="1234567890",
                sector="Gıda", contact_name="Ahmet Yıldız", phone="+90 212 555 01 01",
                email="ahmet@yildiz.com", address="Levent, İstanbul", group="Grup A",
                contract_type="Danışmanlık", contract_value=1200000,
                contract_start="2025-01-01", contract_end="2026-07-01",
                status="Aktif", score=82, estimated_turnover=500000000,
                actual_turnover=480000000, founded_at="2001-03-15"),
        Company(id="cmp-002", name="Tekno Yazılım Ltd.", tax_no="9876543210",
                sector="Teknoloji", contact_name="Zeynep Kaya", phone="+90 216 555 02 02",
                email="zeynep@tekno.com", address="Ataşehir, İstanbul", group="Grup B",
                contract_type="Analiz", contract_value=850000,
                contract_start="2025-03-01", contract_end="2026-03-01",
                status="Aktif", score=74, estimated_turnover=120000000,
                actual_turnover=115000000, founded_at="2015-07-22"),
        Company(id="cmp-003", name="Güneş Enerji A.Ş.", tax_no="5555666677",
                sector="Enerji", contact_name="Mehmet Güneş", phone="+90 312 555 03 03",
                email="mehmet@gunes.com", address="Çankaya, Ankara", group="Grup A",
                contract_type="Danışmanlık", contract_value=2100000,
                contract_start="2024-06-01", contract_end="2025-06-01",
                status="Pasif", score=61, estimated_turnover=350000000,
                actual_turnover=320000000, founded_at="2010-11-05"),
    ])

    db.add_all([
        Group(id="grp-001", name="Grup A", company_count=2, turnover=800000000, debt=120000000, risk_score=45),
        Group(id="grp-002", name="Grup B", company_count=1, turnover=115000000, debt=20000000, risk_score=60),
    ])

    db.add_all([
        Contract(id="con-001", company="Yıldız Holding A.Ş.", type="Danışmanlık",
                 start="2025-01-01", end="2026-07-01", value=1200000, status="Aktif"),
        Contract(id="con-002", company="Tekno Yazılım Ltd.", type="Analiz",
                 start="2025-03-01", end="2026-03-01", value=850000, status="Aktif"),
        Contract(id="con-003", company="Güneş Enerji A.Ş.", type="Danışmanlık",
                 start="2024-06-01", end="2025-06-01", value=2100000, status="Sona Erdi"),
    ])

    db.add_all([
        Subscription(id="sub-001", company="Yıldız Holding A.Ş.", plan="Premium",
                     price=15000, next_payment="2026-06-01", status="Aktif"),
        Subscription(id="sub-002", company="Tekno Yazılım Ltd.", plan="Standart",
                     price=8000, next_payment="2026-06-01", status="Aktif"),
    ])

    db.add_all([
        FinancialProcess(id="fp-001", company="Yıldız Holding A.Ş.", amount=100000,
                         type="Tahsilat", status="Tamamlandı", paid_at="2026-04-01"),
        FinancialProcess(id="fp-002", company="Tekno Yazılım Ltd.", amount=70833,
                         type="Tahsilat", status="Bekliyor", paid_at="2026-05-01"),
        FinancialProcess(id="fp-003", company="Güneş Enerji A.Ş.", amount=175000,
                         type="Tahsilat", status="Gecikmiş", paid_at="2026-03-01"),
    ])

    db.add_all([
        PremiumRequest(id="pr-001", company="Demo Firma A.Ş.", contact="Ali Veli",
                       requested_at="2026-04-15", status="Bekliyor"),
        PremiumRequest(id="pr-002", company="Başka Firma Ltd.", contact="Fatma Demir",
                       requested_at="2026-04-20", status="Bekliyor"),
    ])

    db.commit()
