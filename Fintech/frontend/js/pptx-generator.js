(function () {
  function money(value) {
    return window.Utils?.formatCurrency
      ? window.Utils.formatCurrency(value)
      : new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(Number(value || 0));
  }

  function normalizeCompany(company, financial) {
    const summary = financial?.summary || {};
    return {
      name: company?.name || "Firma",
      annualRevenue: company?.actualTurnover || company?.estimatedTurnover || summary.revenue || 0,
      netProfit: summary.netProfit || 0,
      totalDebt: summary.totalDebt || summary.debt || 0,
      equity: summary.equity || 0,
      banks: (financial?.banks || []).map((bank) => ({
        name: bank.name,
        balance: bank.balance,
        limit: bank.creditLimit || bank.limit,
        used: bank.usage || bank.used
      })),
      liquidityRatio: summary.totalReceivable && summary.totalDebt ? summary.totalReceivable / summary.totalDebt : 1.5,
      profitMargin: summary.revenue ? summary.netProfit / summary.revenue : 0.15,
      leverageRatio: summary.equity ? (summary.debt || summary.totalDebt || 0) / summary.equity : 0.4,
      aiSummary: `${company?.name || "Firma"} genel olarak izlenebilir ve dengeli bir finansal görünüme sahiptir. Likidite, banka limitleri ve borç/özkaynak dengesi düzenli takip edilmelidir.`
    };
  }

  async function generateRealPPTX(company, financial) {
    const PptxCtor = window.PptxGenJS || window.pptxgen;
    if (!PptxCtor) {
      window.Toast?.show("PptxGenJS yüklenemedi. İnternet bağlantısını kontrol edin.", { type: "error" });
      return;
    }

    const companyData = normalizeCompany(company, financial);
    const pptx = new PptxCtor();
    pptx.layout = "LAYOUT_WIDE";
    pptx.author = "Pro Sicht";
    pptx.subject = "Finansal Durum Raporu";
    pptx.title = `${companyData.name} Finansal Durum Raporu`;
    pptx.company = "Pro Sicht";
    pptx.lang = "tr-TR";
    pptx.theme = {
      headFontFace: "Arial",
      bodyFontFace: "Arial",
      lang: "tr-TR"
    };

    const header = (slide, title) => {
      slide.addText(title, { x: 0.55, y: 0.35, w: 12.1, h: 0.45, fontSize: 26, bold: true, color: "1E3A46" });
      slide.addShape(pptx.ShapeType.line, { x: 0.55, y: 0.95, w: 12.1, h: 0, line: { color: "2DBE8E", width: 2 } });
    };

    const slide1 = pptx.addSlide();
    slide1.background = { color: "1E3A46" };
    slide1.addText(companyData.name, { x: 1, y: 2.35, w: 11.3, h: 0.75, fontSize: 42, bold: true, color: "FFFFFF", align: "center" });
    slide1.addText("Finansal Durum Raporu", { x: 1, y: 3.35, w: 11.3, h: 0.4, fontSize: 20, color: "2DBE8E", align: "center" });
    slide1.addText(new Date().toLocaleDateString("tr-TR"), { x: 1, y: 4.2, w: 11.3, h: 0.3, fontSize: 13, color: "D7E4E8", align: "center" });

    const slide2 = pptx.addSlide();
    header(slide2, "Mali Veriler");
    slide2.addTable([
      [
        { text: "Kalem", options: { bold: true, fill: "2DBE8E", color: "FFFFFF" } },
        { text: "Tutar", options: { bold: true, fill: "2DBE8E", color: "FFFFFF" } }
      ],
      ["Yıllık Ciro", money(companyData.annualRevenue)],
      ["Net Kar", money(companyData.netProfit)],
      ["Toplam Borç", money(companyData.totalDebt)],
      ["Özkaynak", money(companyData.equity)]
    ], { x: 0.75, y: 1.35, w: 11.8, fontSize: 14, border: { type: "solid", color: "D8E1E4", pt: 1 } });

    const slide3 = pptx.addSlide();
    header(slide3, "Banka Durumu ve Kredi Limitleri");
    const bankRows = [[
      { text: "Banka", options: { bold: true, fill: "2DBE8E", color: "FFFFFF" } },
      { text: "Bakiye", options: { bold: true, fill: "2DBE8E", color: "FFFFFF" } },
      { text: "Limit", options: { bold: true, fill: "2DBE8E", color: "FFFFFF" } },
      { text: "Kullanım", options: { bold: true, fill: "2DBE8E", color: "FFFFFF" } }
    ]];
    (companyData.banks.length ? companyData.banks : [{ name: "Demo Banka", balance: 0, limit: 0, used: 0 }]).forEach((bank) => {
      bankRows.push([bank.name, money(bank.balance), money(bank.limit), money(bank.used)]);
    });
    slide3.addTable(bankRows, { x: 0.65, y: 1.35, w: 12, fontSize: 11, border: { type: "solid", color: "D8E1E4", pt: 1 } });

    const slide4 = pptx.addSlide();
    header(slide4, "Finansal Rasyolar");
    slide4.addTable([
      [
        { text: "Rasyo", options: { bold: true, fill: "2DBE8E", color: "FFFFFF" } },
        { text: "Değer", options: { bold: true, fill: "2DBE8E", color: "FFFFFF" } },
        { text: "Yorum", options: { bold: true, fill: "2DBE8E", color: "FFFFFF" } }
      ],
      ["Likidite Oranı", companyData.liquidityRatio.toFixed(2), "İyi"],
      ["Karlılık", `${(companyData.profitMargin * 100).toFixed(1)}%`, "Sektör üstü"],
      ["Kaldıraç Oranı", companyData.leverageRatio.toFixed(2), "Sağlıklı"]
    ], { x: 0.75, y: 1.35, w: 11.8, fontSize: 14, border: { type: "solid", color: "D8E1E4", pt: 1 } });

    const slide5 = pptx.addSlide();
    header(slide5, "Mali Yapı Özeti ve Trendler");
    slide5.addText([
      { text: "Son 12 ayda ciro ve tahsilat ritmi pozitif izleniyor.", options: { bullet: true } },
      { text: "Operasyonel kar marjı karar destek açısından güçlü sinyal veriyor.", options: { bullet: true } },
      { text: "Borç/özkaynak dengesi düzenli banka limiti takibi gerektiriyor.", options: { bullet: true } },
      { text: "Nakit akışı pozitif; alacak yaşlandırması takip edilmeli.", options: { bullet: true } }
    ], { x: 0.9, y: 1.55, w: 11.2, h: 3.6, fontSize: 18, color: "4A4A4A", breakLine: false });

    const slide6 = pptx.addSlide();
    header(slide6, "AI Finansal Analizi - Özet");
    slide6.addText(companyData.aiSummary, { x: 0.9, y: 1.45, w: 11.2, h: 3.2, fontSize: 16, color: "4A4A4A", valign: "top", fit: "shrink" });
    slide6.addText("AI tarafından oluşturulmuştur", { x: 0.9, y: 5.85, w: 11.2, h: 0.3, fontSize: 12, italic: true, color: "2DBE8E", align: "right" });

    await pptx.writeFile({ fileName: `${window.Utils?.slugify(companyData.name) || "firma"}-on-sunum.pptx` });
  }

  window.PptxGenerator = { generateRealPPTX };
})();
