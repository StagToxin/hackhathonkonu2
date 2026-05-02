from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from .services import get_ai_analysis, generate_pptx

app = FastAPI()

# KRİTİK: Vanilla JS frontend'in bu backend'e erişmesi için şart
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Geliştirme aşamasında her yerden erişime izin ver
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze_financials(payload: dict):
    # T4 & T8: Hem otomatik hem manuel girişi destekler[cite: 1]
    analysis = get_ai_analysis(payload)
    return {"status": "success", "analysis": analysis}

@app.get("/download-presentation/{company_name}")
async def download_pptx(company_name: str, analysis: str):
    # T5: Sunum oluştur ve link dön[cite: 1]
    file_path = generate_pptx(company_name, analysis)
    return {"download_url": file_path}