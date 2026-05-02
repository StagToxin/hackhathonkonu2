(function () {
  const configuredApiBase = window.localStorage.getItem("apiBaseUrl");
  const API_BASE = configuredApiBase || "http://localhost:8001";
  const USE_MOCK_API = !configuredApiBase;

  function delay(value, ms = 220) {
    return new Promise((resolve) => window.setTimeout(() => resolve(value), ms));
  }

  async function request(path, options = {}) {
    const token = window.localStorage.getItem("authToken");
    const headers = new Headers(options.headers || {});
    if (!(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "API isteği başarısız oldu.");
    }
    const contentType = response.headers.get("content-type") || "";
    return contentType.includes("application/json") ? response.json() : response.blob();
  }

  function runFallback(fallback, ms = 0) {
    const value = typeof fallback === "function" ? fallback() : fallback;
    return ms > 0 ? delay(value, ms) : Promise.resolve(value);
  }

  async function withFallback(path, options, fallback) {
    if (USE_MOCK_API) return runFallback(fallback);

    try {
      return await request(path, options);
    } catch (error) {
      console.info("Mock API kullanılıyor:", path, error.message);
      return runFallback(fallback, 80);
    }
  }

  function log(action, detail = {}) {
    const user = JSON.parse(window.localStorage.getItem("authUser") || "null");
    window.MockData.logs.unshift({
      id: `log-${Date.now()}`,
      action,
      type: detail.type || inferLogType(action),
      status: detail.status || "success",
      detail,
      user: user?.email || "anonymous",
      createdAt: new Date().toISOString()
    });
    if (window.MockData.save) window.MockData.save();
  }

  function inferLogType(action) {
    if (action.startsWith("auth.")) return "Auth";
    if (action.startsWith("ai.")) return "AI";
    if (action.startsWith("ocr.") || action.includes("ocr")) return "OCR";
    if (action.startsWith("premium.")) return "Premium";
    if (action.startsWith("error.")) return "Hata";
    return "CRUD";
  }

  function markdownAnalysis(companyId, payload = {}) {
    const company = window.MockData.companies.find((item) => item.id === companyId) || window.MockData.companies[0];
    const summary = payload.summary || window.MockData.financial.summary;
    const debtToEquity = summary.equity ? (summary.debt / summary.equity).toFixed(2) : "1.31";
    return `## Güçlü Yönler
- Hasılat ve net kâr çizgisi pozitif; net kâr ${window.Utils ? window.Utils.formatCurrency(summary.netProfit) : summary.netProfit} seviyesinde.
- Banka limitleri çeşitlendirilmiş; en az üç banka üzerinden likidite tamponu korunuyor.
- ${company.name} için finansal skor sektör ortalamasının üzerinde.

## Zayıf Yönler
- Kısa vadeli tahsilat riski nakit akışını dönemsel olarak baskılıyor.
- Kredi kullanım oranı bazı bankalarda konfor alanına yakın.

## Riskler
- Borç/özkaynak oranı ${debtToEquity}; 1.20 üzerindeki seviye yakından izlenmeli.
- Vadesi yaklaşan alacaklarda gecikme olursa işletme sermayesi ihtiyacı artabilir.

## Likidite Durumu
Son 12 aylık nakit girişleri çıkışların üzerinde seyrediyor. Mayıs ayında net nakit akışı pozitif, ancak tahsilat vadelerindeki yoğunlaşma günlük likidite planını önemli hale getiriyor.

## Borç/Özkaynak Dengesi
Özkaynak tabanı güçlü olsa da yabancı kaynak finansmanı büyüme iştahını taşıyor. Yeni borçlanmada vade uzatma ve sabit maliyetli finansman tercih edilmeli.

## Öneriler
1. 30 gün üzeri alacaklar için erken uyarı listesi oluşturun.
2. Kredi limitlerini banka bazında yeniden dengeleyin.
3. Yüksek kârlı projelerde tahsilat şartlarını peşinat ağırlıklı güncelleyin.
4. Konsolide grup görünümünde borç ve nakit pozisyonunu aylık izleyin.`;
  }

  const Api = {
    login(credentials) {
      return withFallback("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials)
      }, () => {
        const found = window.MockData.users.find((user) => user.email === credentials.email && user.password === credentials.password);
        if (!found) throw new Error("E-posta veya şifre hatalı");
        log("auth.login", { email: found.email, role: found.role });
        return {
          token: `mock-token-${found.role}`,
          user: { email: found.email, name: found.name, role: found.role, companyId: found.companyId }
        };
      });
    },
    register(payload) {
      return withFallback("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload)
      }, () => {
        window.MockData.pendingCompanies.unshift({
          id: `pen-${Date.now()}`,
          name: payload.companyName,
          contactName: payload.fullName,
          email: payload.email,
          taxNo: payload.taxNo,
          createdAt: new Date().toISOString(),
          status: "Bekliyor"
        });
        log("auth.register", { email: payload.email, company: payload.companyName });
        window.MockData.save();
        return { ok: true, status: "pending_approval" };
      });
    },
    dashboard() {
      return withFallback("/api/admin/dashboard", {}, () => ({
        kpis: {
          totalCompanies: window.MockData.companies.length,
          companyGrowth: 12,
          activeContracts: 28,
          contractsExpiringSoon: 4,
          pendingCollection: 4180000,
          monthlyRevenue: 910000,
          revenueTrend: 9
        },
        revenueTrend: window.MockData.revenueTrend,
        contractDistribution: window.MockData.contractDistribution,
        recentActivities: window.MockData.recentActivities,
        premiumRequests: window.MockData.premiumRequests,
        pendingCompanies: window.MockData.pendingCompanies
      }));
    },
    companies(params = {}) {
      return withFallback(`/api/admin/companies?${new URLSearchParams(params).toString()}`, {}, () => {
        let rows = [...window.MockData.companies];
        if (params.search) {
          const key = params.search.trim().toLocaleLowerCase("tr-TR");
          const taxKey = key.replace(/\D/g, "");
          rows = rows.filter((company) => {
            const searchableText = `${company.name} ${company.taxNo} ${company.contractType} ${company.contactName || ""}`.toLocaleLowerCase("tr-TR");
            const searchableTax = String(company.taxNo || "").replace(/\D/g, "");
            return searchableText.includes(key) || (taxKey.length > 0 && searchableTax.includes(taxKey));
          });
        }
        if (params.contractType) rows = rows.filter((company) => company.contractType === params.contractType);
        if (params.status) rows = rows.filter((company) => company.status === params.status);
        if (params.contractEndFrom) rows = rows.filter((company) => company.contractEnd && company.contractEnd >= params.contractEndFrom);
        if (params.contractEndTo) rows = rows.filter((company) => company.contractEnd && company.contractEnd <= params.contractEndTo);
        return { rows, total: rows.length, page: Number(params.page || 1), pageSize: 10 };
      });
    },
    company(id) {
      return withFallback(`/api/admin/companies/${id}`, {}, () => window.MockData.companies.find((company) => company.id === id) || window.MockData.companies[0]);
    },
    createCompany(payload) {
      return withFallback("/api/admin/companies", {
        method: "POST",
        body: JSON.stringify(payload)
      }, () => {
        const company = { id: `cmp-${Date.now()}`, score: 68, status: "Aktif", ...payload };
        window.MockData.companies.unshift(company);
        log("company.create", { company: company.name });
        window.MockData.save();
        return company;
      });
    },
    updateCompany(id, payload) {
      return withFallback(`/api/admin/companies/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      }, () => {
        const index = window.MockData.companies.findIndex((company) => company.id === id);
        if (index >= 0) window.MockData.companies[index] = { ...window.MockData.companies[index], ...payload };
        log("company.update", { id, fields: Object.keys(payload) });
        window.MockData.save();
        return window.MockData.companies[index] || payload;
      });
    },
    deleteCompany(id) {
      return withFallback(`/api/admin/companies/${id}`, { method: "DELETE" }, () => {
        const index = window.MockData.companies.findIndex((company) => company.id === id);
        if (index >= 0) window.MockData.companies.splice(index, 1);
        log("company.delete", { id });
        window.MockData.save();
        return { ok: true };
      });
    },
    pendingCompanies() {
      return withFallback("/api/admin/pending-companies", {}, () => window.MockData.pendingCompanies);
    },
    approveCompany(id) {
      return withFallback(`/api/admin/pending-companies/${id}/approve`, { method: "POST" }, () => {
        const item = window.MockData.pendingCompanies.find((company) => company.id === id);
        if (item) item.status = "Onaylandı";
        log("company.approve", { id });
        window.MockData.save();
        return { ok: true };
      });
    },
    rejectCompany(id) {
      return withFallback(`/api/admin/pending-companies/${id}/reject`, { method: "POST" }, () => {
        const item = window.MockData.pendingCompanies.find((company) => company.id === id);
        if (item) item.status = "Reddedildi";
        log("company.reject", { id });
        window.MockData.save();
        return { ok: true };
      });
    },
    parseOcr(file) {
      const form = new FormData();
      form.append("file", file);
      return withFallback("/api/ocr/parse", { method: "POST", body: form }, () => {
        log("ai.ocr.parse", { fileName: file?.name, durationMs: 1180 });
        window.MockData.save();
        return {
          fields: {
            name: "Demo OCR Sanayi A.Ş.",
            taxNo: "7890123456",
            tradeRegistryNo: "IST-553901",
            foundedAt: "2017-04-18",
            sector: "Makine imalatı",
            contactName: "Can Özdemir",
            phone: "+90 216 555 44 33",
            email: "can@demoocr.com",
            address: "Ataşehir, İstanbul",
            estimatedTurnover: 68000000,
            actualTurnover: 64200000,
            contractValue: 840000,
            contractStart: "2026-05-01",
            contractEnd: "2027-05-01",
            contractType: "Analiz",
            group: "Demo Grup"
          }
        };
      });
    },
    financialReport(companyId) {
      return withFallback(`/api/admin/financial-report/${companyId}`, {}, () => window.MockData.financial);
    },
    analyzeFinancial(companyId, payload = {}) {
      return withFallback(`/api/ai/analyze/${companyId}`, {
        method: "POST",
        body: JSON.stringify(payload)
      }, () => {
        log("ai.financial_analysis", { type: "AI", companyId, responseTimeMs: 4200 });
        return { markdown: markdownAnalysis(companyId, payload), generatedAt: new Date().toISOString() };
      });
    },
    financialStatus(companyId) {
      return withFallback(`/api/admin/financial-status/${companyId}`, {}, () => window.MockData.financial);
    },
    investments(companyId) {
      return withFallback(`/api/admin/investments/${companyId}`, {}, () => window.MockData.investments);
    },
    generatePptx(companyId) {
      return withFallback(`/api/pptx/${companyId}`, {}, () => {
        const company = window.MockData.companies.find((item) => item.id === companyId) || window.MockData.companies[0];
        log("ai.pptx.generate", { type: "AI", companyId, responseTimeMs: 3100 });
        const blob = new Blob([`Mock PPTX package for ${company.name}`], {
          type: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        });
        return blob;
      });
    },
    contracts() {
      return withFallback("/api/admin/contracts", {}, () => window.MockData.contracts);
    },
    subscriptions() {
      return withFallback("/api/admin/subscriptions", {}, () => window.MockData.subscriptions);
    },
    financialProcess(params = {}) {
      return withFallback(`/api/admin/financial-process?${new URLSearchParams(params).toString()}`, {}, () => {
        let rows = [...window.MockData.processPayments];
        if (params.status) rows = rows.filter((row) => row.status === params.status);
        if (params.company) rows = rows.filter((row) => row.company === params.company);
        if (params.dateFrom) rows = rows.filter((row) => row.paidAt >= params.dateFrom);
        if (params.dateTo) rows = rows.filter((row) => row.paidAt <= params.dateTo);
        return rows;
      });
    },
    premiumRequests() {
      return withFallback("/api/admin/premium-requests", {}, () => window.MockData.premiumRequests);
    },
    approvePremium(id) {
      return withFallback(`/api/admin/premium-requests/${id}/approve`, { method: "POST" }, () => {
        const requestItem = window.MockData.premiumRequests.find((item) => item.id === id);
        if (requestItem) requestItem.status = "Onaylandı";
        log("premium.approve", { type: "Premium", id });
        window.MockData.save();
        return { ok: true };
      });
    },
    rejectPremium(id, reason = "") {
      return withFallback(`/api/admin/premium-requests/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason })
      }, () => {
        const requestItem = window.MockData.premiumRequests.find((item) => item.id === id);
        if (requestItem) requestItem.status = "Reddedildi";
        log("premium.reject", { type: "Premium", id, reason });
        window.MockData.save();
        return { ok: true };
      });
    },
    groups() {
      return withFallback("/api/admin/groups", {}, () => window.MockData.groups);
    },
    createGroup(payload) {
      return withFallback("/api/admin/groups", {
        method: "POST",
        body: JSON.stringify(payload)
      }, () => {
        const group = { id: `grp-${Date.now()}`, turnover: 0, debt: 0, riskScore: 55, ...payload };
        window.MockData.groups.unshift(group);
        log("company.group_create", { type: "CRUD", group: group.name });
        window.MockData.save();
        return group;
      });
    },
    logs(params = {}) {
      return withFallback(`/api/admin/logs?${new URLSearchParams(params).toString()}`, {}, () => {
        let rows = [...window.MockData.logs];
        if (params.type) rows = rows.filter((row) => row.type === params.type);
        if (params.user) rows = rows.filter((row) => String(row.user).toLocaleLowerCase("tr-TR").includes(params.user.toLocaleLowerCase("tr-TR")));
        if (params.search) rows = rows.filter((row) => JSON.stringify(row).toLocaleLowerCase("tr-TR").includes(params.search.toLocaleLowerCase("tr-TR")));
        if (params.dateFrom) rows = rows.filter((row) => row.createdAt.slice(0, 10) >= params.dateFrom);
        if (params.dateTo) rows = rows.filter((row) => row.createdAt.slice(0, 10) <= params.dateTo);
        return rows;
      });
    },
    log
  };

  window.Api = Api;
})();
