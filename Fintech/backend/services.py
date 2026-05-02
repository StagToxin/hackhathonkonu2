import ollama
from pptx import Presentation
import logging

# T9: Loglama[cite: 1]
logging.basicConfig(filename='logs/api.log', level=logging.INFO)

def get_ai_analysis(data: dict):
    try:
        # T4: LLM ile finansal analiz üretimi[cite: 1]
        response = ollama.chat(model='qwen:35b', messages=[
            {'role': 'system', 'content': 'Profesyonel bir finansal analistsin.'},
            {'role': 'user', 'content': f"Şu verileri analiz et: {data}"}
        ])
        return response['message']['content']
    except Exception as e:
        logging.error(f"AI Hatası: {e}")
        return "Analiz şu an yapılamıyor, manuel giriş yapın."

def generate_pptx(company_name: str, report_text: str):
    # T5: .pptx dosyası üretimi[cite: 1]
    prs = Presentation()
    slide = prs.slides.add_slide(prs.slide_layouts[0])
    slide.shapes.title.text = company_name
    slide.placeholders[1].text = "Finansal Analiz ve Risk Raporu"
    
    output_path = f"outputs/{company_name}_sunum.pptx"
    prs.save(output_path)
    return output_path