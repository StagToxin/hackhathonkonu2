import uuid
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database import (
    SessionLocal, engine, Base,
    User, Company, PendingCompany, Group, FinancialReport,
    Contract, Subscription, FinancialProcess, PremiumRequest, Log,
    seed_data,
)
import services

# Dizinleri oluştur
Path("logs").mkdir(exist_ok=True)
Path("outputs").mkdir(exist_ok=True)

logging.basicConfig(
    filename="logs/api.log",
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)

# Veritabanı tablolarını oluştur ve seed et
Base.metadata.create_all(bind=engine)
with SessionLocal() as _db:
    seed_data(_db)

app = FastAPI(title="Fintech API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Auth ----------
security = HTTPBearer(auto_error=False)
# token -> user dict (bellek içi oturum)
_sessions: dict[str, dict] = {}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    if not credentials:
        raise HTTPException(status_code=401, detail="Token gerekli")
    user = _sessions.get(credentials.credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Geçersiz veya süresi dolmuş token")
    return user


def add_log(db: Session, action: str, user_email: str, detail: dict = None, log_type: str = None):
    if log_type is None:
        if action.startswith("auth."): log_type = "Auth"
        elif action.startswith("ai."): log_type = "AI"
        elif "ocr" in action: log_type = "OCR"
        elif action.startswith("premium."): log_type = "Premium"
        elif action.startswith("error."): log_type = "Hata"
        else: log_type = "CRUD"

    db.add(Log(
        id=f"log-{uuid.uuid4().hex[:8]}",
        action=action,
        type=log_type,
        status="success",
        detail=detail or {},
        user=user_email,
        created_at=datetime.now(timezone.utc).isoformat(),
    ))
    db.commit()


# ===== AUTH =====

@app.post("/api/auth/login")
def login(payload: dict, db: Session = Depends(get_db)):
    email = payload.get("email", "").strip().lower()
    password = payload.get("password", "")

    user = db.query(User).filter(User.email == email).first()
    if not user or user.password != password:
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı")

    token = f"tok-{uuid.uuid4().hex}"
    _sessions[token] = {"email": user.email, "name": user.name, "role": user.role, "companyId": user.company_id}

    add_log(db, "auth.login", user.email, {"role": user.role})
    logger.info(f"Login: {user.email}")

    return {
        "token": token,
        "user": {"email": user.email, "name": user.name, "role": user.role, "companyId": user.company_id},
    }


@app.post("/api/auth/register")
def register(payload: dict, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.get("email")).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu e-posta zaten kayıtlı")

    pending = PendingCompany(
        id=f"pen-{uuid.uuid4().hex[:8]}",
        name=payload.get("companyName", ""),
        contact_name=payload.get("fullName", ""),
        email=payload.get("email", ""),
        tax_no=payload.get("taxNo", ""),
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    db.add(pending)
    db.commit()

    add_log(db, "auth.register", payload.get("email", "anonymous"),
            {"company": payload.get("companyName")})

    return {"ok": True, "status": "pending_approval"}


# ===== DASHBOARD =====

@app.get("/api/admin/dashboard")
def dashboard(db: Session = Depends(get_db), _=Depends(get_current_user)):
    companies = db.query(Company).all()
    contracts = db.query(Contract).all()
    active_contracts = sum(1 for c in contracts if c.status == "Aktif")
    expiring_soon = sum(1 for c in contracts if c.end and c.end <= "2026-08-01" and c.status == "Aktif")

    revenue_trend = [
        {"month": "Oca", "revenue": 720000}, {"month": "Şub", "revenue": 780000},
        {"month": "Mar", "revenue": 850000}, {"month": "Nis", "revenue": 910000},
        {"month": "May", "revenue": 960000}, {"month": "Haz", "revenue": 920000},
    ]
    contract_distribution = [
        {"label": "Danışmanlık", "value": sum(1 for c in contracts if c.type == "Danışmanlık")},
        {"label": "Analiz", "value": sum(1 for c in contracts if c.type == "Analiz")},
    ]
    recent_activities = db.query(Log).order_by(Log.created_at.desc()).limit(10).all()
    premium_requests = db.query(PremiumRequest).filter(PremiumRequest.status == "Bekliyor").all()
    pending_companies = db.query(PendingCompany).filter(PendingCompany.status == "Bekliyor").all()

    return {
        "kpis": {
            "totalCompanies": len(companies),
            "companyGrowth": 12,
            "activeContracts": active_contracts,
            "contractsExpiringSoon": expiring_soon,
            "pendingCollection": 4180000,
            "monthlyRevenue": 910000,
            "revenueTrend": 9,
        },
        "revenueTrend": revenue_trend,
        "contractDistribution": contract_distribution,
        "recentActivities": [
            {"id": r.id, "action": r.action, "type": r.type, "user": r.user, "createdAt": r.created_at}
            for r in recent_activities
        ],
        "premiumRequests": [_pr_to_dict(p) for p in premium_requests],
        "pendingCompanies": [_pending_to_dict(p) for p in pending_companies],
    }


# ===== COMPANIES =====

def _company_to_dict(c: Company) -> dict:
    return {
        "id": c.id, "name": c.name, "taxNo": c.tax_no, "tradeRegistryNo": c.trade_registry_no,
        "sector": c.sector, "contactName": c.contact_name, "phone": c.phone, "email": c.email,
        "address": c.address, "group": c.group, "contractType": c.contract_type,
        "contractValue": c.contract_value, "contractStart": c.contract_start,
        "contractEnd": c.contract_end, "status": c.status, "score": c.score,
        "estimatedTurnover": c.estimated_turnover, "actualTurnover": c.actual_turnover,
        "foundedAt": c.founded_at, "createdAt": c.created_at,
    }


@app.get("/api/admin/companies")
def list_companies(
    search: Optional[str] = None,
    contractType: Optional[str] = None,
    status: Optional[str] = None,
    contractEndFrom: Optional[str] = None,
    contractEndTo: Optional[str] = None,
    page: int = 1,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(Company)
    if search:
        kw = search.strip().lower()
        q = q.filter(
            (Company.name.ilike(f"%{kw}%")) |
            (Company.tax_no.ilike(f"%{kw}%")) |
            (Company.contact_name.ilike(f"%{kw}%"))
        )
    if contractType:
        q = q.filter(Company.contract_type == contractType)
    if status:
        q = q.filter(Company.status == status)
    if contractEndFrom:
        q = q.filter(Company.contract_end >= contractEndFrom)
    if contractEndTo:
        q = q.filter(Company.contract_end <= contractEndTo)

    total = q.count()
    page_size = 10
    rows = q.offset((page - 1) * page_size).limit(page_size).all()

    return {"rows": [_company_to_dict(c) for c in rows], "total": total, "page": page, "pageSize": page_size}


@app.get("/api/admin/companies/{company_id}")
def get_company(company_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    c = db.query(Company).filter(Company.id == company_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Şirket bulunamadı")
    return _company_to_dict(c)


@app.post("/api/admin/companies")
def create_company(payload: dict, db: Session = Depends(get_db), current=Depends(get_current_user)):
    company = Company(
        id=f"cmp-{uuid.uuid4().hex[:8]}",
        name=payload.get("name", ""),
        tax_no=payload.get("taxNo", ""),
        trade_registry_no=payload.get("tradeRegistryNo"),
        sector=payload.get("sector"),
        contact_name=payload.get("contactName"),
        phone=payload.get("phone"),
        email=payload.get("email"),
        address=payload.get("address"),
        group=payload.get("group"),
        contract_type=payload.get("contractType"),
        contract_value=payload.get("contractValue"),
        contract_start=payload.get("contractStart"),
        contract_end=payload.get("contractEnd"),
        status=payload.get("status", "Aktif"),
        score=payload.get("score", 65),
        estimated_turnover=payload.get("estimatedTurnover"),
        actual_turnover=payload.get("actualTurnover"),
        founded_at=payload.get("foundedAt"),
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    db.add(company)
    db.commit()
    add_log(db, "company.create", current["email"], {"company": company.name})
    return _company_to_dict(company)


@app.put("/api/admin/companies/{company_id}")
def update_company(company_id: str, payload: dict, db: Session = Depends(get_db), current=Depends(get_current_user)):
    c = db.query(Company).filter(Company.id == company_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Şirket bulunamadı")

    field_map = {
        "name": "name", "taxNo": "tax_no", "tradeRegistryNo": "trade_registry_no",
        "sector": "sector", "contactName": "contact_name", "phone": "phone",
        "email": "email", "address": "address", "group": "group",
        "contractType": "contract_type", "contractValue": "contract_value",
        "contractStart": "contract_start", "contractEnd": "contract_end",
        "status": "status", "score": "score",
        "estimatedTurnover": "estimated_turnover", "actualTurnover": "actual_turnover",
        "foundedAt": "founded_at",
    }
    for js_key, db_col in field_map.items():
        if js_key in payload:
            setattr(c, db_col, payload[js_key])

    db.commit()
    add_log(db, "company.update", current["email"], {"id": company_id, "fields": list(payload.keys())})
    return _company_to_dict(c)


@app.delete("/api/admin/companies/{company_id}")
def delete_company(company_id: str, db: Session = Depends(get_db), current=Depends(get_current_user)):
    c = db.query(Company).filter(Company.id == company_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Şirket bulunamadı")
    db.delete(c)
    db.commit()
    add_log(db, "company.delete", current["email"], {"id": company_id})
    return {"ok": True}


# ===== PENDING COMPANIES =====

def _pending_to_dict(p: PendingCompany) -> dict:
    return {"id": p.id, "name": p.name, "contactName": p.contact_name,
            "email": p.email, "taxNo": p.tax_no, "status": p.status, "createdAt": p.created_at}


@app.get("/api/admin/pending-companies")
def list_pending(db: Session = Depends(get_db), _=Depends(get_current_user)):
    rows = db.query(PendingCompany).all()
    return [_pending_to_dict(p) for p in rows]


@app.post("/api/admin/pending-companies/{pending_id}/approve")
def approve_company(pending_id: str, db: Session = Depends(get_db), current=Depends(get_current_user)):
    p = db.query(PendingCompany).filter(PendingCompany.id == pending_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Bulunamadı")
    p.status = "Onaylandı"
    db.commit()
    add_log(db, "company.approve", current["email"], {"id": pending_id})
    return {"ok": True}


@app.post("/api/admin/pending-companies/{pending_id}/reject")
def reject_company(pending_id: str, db: Session = Depends(get_db), current=Depends(get_current_user)):
    p = db.query(PendingCompany).filter(PendingCompany.id == pending_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Bulunamadı")
    p.status = "Reddedildi"
    db.commit()
    add_log(db, "company.reject", current["email"], {"id": pending_id})
    return {"ok": True}


# ===== GROUPS =====

def _group_to_dict(g: Group) -> dict:
    return {"id": g.id, "name": g.name, "companyCount": g.company_count,
            "turnover": g.turnover, "debt": g.debt, "riskScore": g.risk_score}


@app.get("/api/admin/groups")
def list_groups(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return [_group_to_dict(g) for g in db.query(Group).all()]


@app.post("/api/admin/groups")
def create_group(payload: dict, db: Session = Depends(get_db), current=Depends(get_current_user)):
    g = Group(
        id=f"grp-{uuid.uuid4().hex[:8]}",
        name=payload.get("name", ""),
        company_count=0, turnover=0, debt=0, risk_score=55,
    )
    db.add(g)
    db.commit()
    add_log(db, "company.group_create", current["email"], {"group": g.name})
    return _group_to_dict(g)


# ===== FINANCIAL =====

def _mock_financial(company: Company) -> dict:
    rev = company.actual_turnover or 50000000
    profit = rev * 0.08
    debt = rev * 0.25
    equity = rev * 0.19
    return {
        "summary": {
            "revenue": rev, "netProfit": profit, "debt": debt,
            "equity": equity, "cashFlow": profit * 0.6,
        },
        "monthlyData": [
            {"month": m, "revenue": rev / 12 * (0.9 + i * 0.02), "expense": rev / 12 * 0.75}
            for i, m in enumerate(["Oca", "Şub", "Mar", "Nis", "May", "Haz",
                                    "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"])
        ],
        "bankExposure": [
            {"bank": "Ziraat Bankası", "limit": debt * 0.4, "used": debt * 0.3},
            {"bank": "İş Bankası", "limit": debt * 0.35, "used": debt * 0.25},
            {"bank": "Garanti BBVA", "limit": debt * 0.25, "used": debt * 0.2},
        ],
    }


@app.get("/api/admin/financial-report/{company_id}")
def financial_report(company_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Şirket bulunamadı")
    return _mock_financial(company)


@app.get("/api/admin/financial-status/{company_id}")
def financial_status(company_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Şirket bulunamadı")
    return _mock_financial(company)


@app.get("/api/admin/investments/{company_id}")
def investments(company_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    company = db.query(Company).filter(Company.id == company_id).first()
    rev = company.actual_turnover if company else 50000000
    return [
        {"id": "inv-1", "name": "Makine Parkı Yenileme", "amount": rev * 0.05, "status": "Devam Ediyor", "roi": 18},
        {"id": "inv-2", "name": "Dijital Dönüşüm", "amount": rev * 0.03, "status": "Planlanan", "roi": 24},
        {"id": "inv-3", "name": "Depo Genişleme", "amount": rev * 0.04, "status": "Tamamlandı", "roi": 15},
    ]


# ===== CONTRACTS & SUBSCRIPTIONS =====

@app.get("/api/admin/contracts")
def list_contracts(db: Session = Depends(get_db), _=Depends(get_current_user)):
    rows = db.query(Contract).all()
    return [{"id": c.id, "company": c.company, "type": c.type, "start": c.start,
             "end": c.end, "value": c.value, "status": c.status} for c in rows]


@app.get("/api/admin/subscriptions")
def list_subscriptions(db: Session = Depends(get_db), _=Depends(get_current_user)):
    rows = db.query(Subscription).all()
    return [{"id": s.id, "company": s.company, "plan": s.plan,
             "price": s.price, "nextPayment": s.next_payment, "status": s.status} for s in rows]


# ===== FINANCIAL PROCESS =====

@app.get("/api/admin/financial-process")
def financial_process(
    status: Optional[str] = None,
    company: Optional[str] = None,
    dateFrom: Optional[str] = None,
    dateTo: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(FinancialProcess)
    if status:
        q = q.filter(FinancialProcess.status == status)
    if company:
        q = q.filter(FinancialProcess.company.ilike(f"%{company}%"))
    if dateFrom:
        q = q.filter(FinancialProcess.paid_at >= dateFrom)
    if dateTo:
        q = q.filter(FinancialProcess.paid_at <= dateTo)

    rows = q.all()
    return [{"id": r.id, "company": r.company, "amount": r.amount,
             "type": r.type, "status": r.status, "paidAt": r.paid_at} for r in rows]


# ===== PREMIUM REQUESTS =====

def _pr_to_dict(p: PremiumRequest) -> dict:
    return {"id": p.id, "company": p.company, "contact": p.contact,
            "requestedAt": p.requested_at, "status": p.status}


@app.get("/api/admin/premium-requests")
def list_premium_requests(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return [_pr_to_dict(p) for p in db.query(PremiumRequest).all()]


@app.post("/api/admin/premium-requests/{req_id}/approve")
def approve_premium(req_id: str, db: Session = Depends(get_db), current=Depends(get_current_user)):
    p = db.query(PremiumRequest).filter(PremiumRequest.id == req_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Bulunamadı")
    p.status = "Onaylandı"
    db.commit()
    add_log(db, "premium.approve", current["email"], {"id": req_id}, "Premium")
    return {"ok": True}


@app.post("/api/admin/premium-requests/{req_id}/reject")
def reject_premium(req_id: str, payload: dict = None, db: Session = Depends(get_db), current=Depends(get_current_user)):
    p = db.query(PremiumRequest).filter(PremiumRequest.id == req_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Bulunamadı")
    p.status = "Reddedildi"
    if payload:
        p.reason = payload.get("reason", "")
    db.commit()
    add_log(db, "premium.reject", current["email"], {"id": req_id}, "Premium")
    return {"ok": True}


# ===== LOGS =====

@app.get("/api/admin/logs")
def list_logs(
    type: Optional[str] = None,
    user: Optional[str] = None,
    search: Optional[str] = None,
    dateFrom: Optional[str] = None,
    dateTo: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(Log)
    if type:
        q = q.filter(Log.type == type)
    if user:
        q = q.filter(Log.user.ilike(f"%{user}%"))
    if dateFrom:
        q = q.filter(Log.created_at >= dateFrom)
    if dateTo:
        q = q.filter(Log.created_at <= dateTo)

    rows = q.order_by(Log.created_at.desc()).limit(200).all()

    if search:
        kw = search.lower()
        rows = [r for r in rows if kw in (r.action + r.user + str(r.detail or "")).lower()]

    return [{"id": r.id, "action": r.action, "type": r.type, "status": r.status,
             "detail": r.detail, "user": r.user, "createdAt": r.created_at} for r in rows]


# ===== OCR =====

@app.post("/api/ocr/parse")
async def parse_ocr(file: UploadFile = File(...), current=Depends(get_current_user), db: Session = Depends(get_db)):
    content = await file.read()

    # Metin tabanlı dosyaysa direkt oku, değilse AI'ya başlık ver
    try:
        text = content.decode("utf-8", errors="ignore")
    except Exception:
        text = f"Dosya adı: {file.filename}"

    fields = services.parse_ocr_with_ai(text)
    add_log(db, "ai.ocr.parse", current["email"], {"fileName": file.filename}, "OCR")

    return {"fields": fields}


# ===== AI ANALYSIS =====

@app.post("/api/ai/analyze/{company_id}")
def analyze_financial(company_id: str, payload: dict = None, db: Session = Depends(get_db), current=Depends(get_current_user)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Şirket bulunamadı")

    data = {
        "name": company.name,
        "sector": company.sector,
        "summary": (payload or {}).get("summary", _mock_financial(company)["summary"]),
    }

    markdown = services.get_ai_analysis(data)
    generated_at = datetime.now(timezone.utc).isoformat()

    # Sonucu DB'ye kaydet
    report = FinancialReport(
        company_id=company_id,
        ai_analysis=markdown,
        raw_data=data,
        created_at=generated_at,
    )
    db.add(report)
    db.commit()

    add_log(db, "ai.financial_analysis", current["email"],
            {"companyId": company_id, "company": company.name}, "AI")

    return {"markdown": markdown, "generatedAt": generated_at}


# ===== PPTX =====

@app.get("/api/pptx/{company_id}")
def get_pptx(company_id: str, db: Session = Depends(get_db), current=Depends(get_current_user)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Şirket bulunamadı")

    # Son analiz raporunu al, yoksa yeni üret
    report = (
        db.query(FinancialReport)
        .filter(FinancialReport.company_id == company_id)
        .order_by(FinancialReport.created_at.desc())
        .first()
    )

    if report and report.ai_analysis:
        analysis = report.ai_analysis
    else:
        analysis = services.get_ai_analysis({"name": company.name, "sector": company.sector,
                                              "summary": _mock_financial(company)["summary"]})

    file_path = services.generate_pptx(company.name, analysis)

    add_log(db, "ai.pptx.generate", current["email"],
            {"companyId": company_id, "company": company.name}, "AI")

    return FileResponse(
        path=file_path,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        filename=f"{company.name}_sunum.pptx",
    )


# ===== ESKI ENDPOINT'LER (geriye dönük uyumluluk) =====

@app.post("/analyze")
def analyze_legacy(payload: dict):
    return {"status": "success", "analysis": services.get_ai_analysis(payload)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
