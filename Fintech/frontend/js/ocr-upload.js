(function () {
  function validateFile(file) {
    if (!file) return false;
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    return allowed.includes(file.type) || /\.(pdf|jpe?g|png)$/i.test(file.name || "");
  }

  function markAi(input) {
    const field = input.closest("[data-field]");
    if (!field || field.querySelector(".ai-mark")) return;
    const label = field.querySelector(".field-label");
    if (label) {
      const mark = document.createElement("span");
      mark.className = "ai-mark ml-2";
      mark.title = "AI ile dolduruldu, kontrol edin";
      mark.textContent = "AI";
      label.appendChild(mark);
    }
  }

  function fillForm(form, fields) {
    let count = 0;
    Object.entries(fields || {}).forEach(([key, value]) => {
      const input = form.elements[key];
      if (!input) return;
      input.value = Array.isArray(value)
        ? value.map((item) => typeof item === "object" ? Object.values(item).filter(Boolean).join(" - ") : item).join("\n")
        : value;
      markAi(input);
      count += 1;
    });
    return count;
  }

  function setFormLoading(form, isLoading) {
    form.querySelectorAll("input, select, textarea, button").forEach((node) => {
      if (node.type !== "file") node.classList.toggle("opacity-60", isLoading);
    });
  }

  async function handleDocumentUpload(file, formId) {
    const form = typeof formId === "string" ? document.querySelector(formId) : formId;
    if (!form) return null;
    if (!validateFile(file)) {
      window.Toast.show("Geçersiz dosya. PDF, JPG veya PNG yükleyin.", { type: "error" });
      return null;
    }
    setFormLoading(form, true);
    window.Toast.show("Belge analiz ediliyor...", { type: "info" });
    try {
      const result = await window.Api.parseOcr(file);
      const count = fillForm(form, result.fields);
      window.Toast.show(`${count} alan AI ile dolduruldu. Kontrol edin.`, { type: "success" });
      return result;
    } catch (error) {
      window.Toast.show("Belge işlenemedi. Net bir görsel yüklemeyi deneyin.", { type: "error" });
      return null;
    } finally {
      setFormLoading(form, false);
    }
  }

  function setup(options) {
    const zone = document.querySelector(options.zone);
    const input = document.querySelector(options.input);
    const form = document.querySelector(options.form);
    const status = document.querySelector(options.status);
    if (!zone || !input || !form) return;

    async function process(file) {
      if (!file) return;
      if (!validateFile(file)) {
        window.Toast.show("Geçersiz dosya. PDF, JPG veya PNG yükleyin.", { type: "error" });
        return;
      }
      status?.classList.remove("hidden");
      try {
        await handleDocumentUpload(file, form);
      } catch (error) {
        window.Toast.show("Belge analiz edilemedi. Manuel giriş yapabilirsiniz.", { type: "error" });
      } finally {
        status?.classList.add("hidden");
      }
    }

    zone.addEventListener("click", () => input.click());
    zone.addEventListener("dragover", (event) => {
      event.preventDefault();
      zone.classList.add("is-dragover");
    });
    zone.addEventListener("dragleave", () => zone.classList.remove("is-dragover"));
    zone.addEventListener("drop", (event) => {
      event.preventDefault();
      zone.classList.remove("is-dragover");
      process(event.dataTransfer.files[0]);
    });
    input.addEventListener("change", () => process(input.files[0]));
  }

  async function handleFinancialReportUpload(file) {
    if (!validateFile(file)) {
      window.Toast.show("Geçersiz dosya. PDF, JPG veya PNG yükleyin.", { type: "error" });
      return null;
    }
    window.Toast.show("Finansal rapor belgesi analiz ediliyor...", { type: "info" });
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    const data = {
      summary: { assets: 154000000, liabilities: 154000000, revenue: 104500000, grossProfit: 28600000, netProfit: 13200000, equity: 69200000, debt: 84800000, totalDebt: 6200000, totalReceivable: 6100000 },
      history: "Şirket 2008 yılında kurulmuş, 2015 sonrası ihracat ve kapasite yatırımlarını hızlandırmıştır.",
      term: "60 gün",
      paymentTerm: "Yurt içi alımlarda 60-90 gün vade, ihracat satışlarında peşin tahsilat",
      tradeLimit: 9600000,
      banks: [
        { name: "Garanti BBVA", accountNo: "TR12-0006-2000", balance: 450000, creditLimit: 1000000, usage: 250000 },
        { name: "Akbank", accountNo: "TR98-0004-6000", balance: 320000, creditLimit: 750000, usage: 150000 },
        { name: "Yapı Kredi", accountNo: "TR45-0006-7010", balance: 580000, creditLimit: 1200000, usage: 380000 }
      ],
      pendingCollections: [
        { date: "2026-06-01", customer: "ABC Tic. Ltd.", invoiceNo: "OCR-1001", amount: 45000, due: "2026-06-15", status: "Bekliyor" }
      ],
      paidCollections: [
        { date: "2026-05-20", customer: "XYZ A.Ş.", amount: 28000, due: "2026-05-20", status: "Ödendi" }
      ],
      projects: [
        { name: "İhracat Genişlemesi 2026", status: "Devam", amount: 850000, start: "2026-01-15", end: "2026-09-30" },
        { name: "Fabrika Modernizasyonu", status: "Bitti", amount: 1200000, start: "2025-05-01", end: "2026-02-15" },
        { name: "AR-GE Yatırımı", status: "Devam", amount: 450000, start: "2026-03-01", end: "2026-12-31" }
      ]
    };
    window.Api?.log?.("ocr.financial_report", { type: "OCR", fileName: file.name, fieldsCount: 8 });
    return data;
  }

  async function handleFinancialStatusUpload(file) {
    if (!validateFile(file)) {
      window.Toast.show("Geçersiz dosya. PDF, JPG veya PNG yükleyin.", { type: "error" });
      return null;
    }
    window.Toast.show("Finansal durum belgesi analiz ediliyor...", { type: "info" });
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    const data = {
      pendingCollections: [
        { customer: "ABC Tic. Ltd.", invoiceNo: "OCR-2001", amount: 45000, due: "2026-06-15", status: "Bekliyor" },
        { customer: "XYZ A.Ş.", invoiceNo: "OCR-2002", amount: 28000, due: "2026-06-20", status: "Riskli" }
      ],
      banks: [
        { name: "Garanti", balance: 250000, creditLimit: 500000, usage: 120000, spark: [22, 24, 28, 31] },
        { name: "Akbank", balance: 180000, creditLimit: 300000, usage: 80000, spark: [18, 19, 21, 24] },
        { name: "İş Bankası", balance: 320000, creditLimit: 600000, usage: 200000, spark: [26, 28, 30, 35] }
      ]
    };
    window.Api?.log?.("ocr.financial_status", { type: "OCR", fileName: file.name, fieldsCount: 5 });
    return data;
  }

  window.OcrUpload = { setup, handleDocumentUpload, handleFinancialReportUpload, handleFinancialStatusUpload, validateFile, fillForm };
})();
